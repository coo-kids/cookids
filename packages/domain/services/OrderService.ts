import "@tsed/ajv";
import { validate } from "@tsed/ajv";
import { inject, Injectable } from "@tsed/di";
import { deserialize, serialize } from "@tsed/json-mapper";
import { CatalogProvider } from "../catalog/CatalogProvider.js";
import { SiteContentProvider } from "../content/SiteContentProvider.js";
import { CreateOrder } from "../dto/CreateOrder.js";
import { OrderValidationError } from "../errors/OrderValidationError.js";
import { UnknownProductError } from "../errors/UnknownProductError.js";
import { MailService } from "../mail/MailService.js";
import { Order } from "../models/Order.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
import { findProduct } from "../utils/findProduct.js";

@Injectable()
export class OrderService {
  private readonly orderRepository = inject<OrderRepository>(OrderRepository);
  private readonly mailService = inject<MailService>(MailService);
  private readonly catalogProvider = inject<CatalogProvider>(CatalogProvider);
  private readonly siteContentProvider = inject<SiteContentProvider>(SiteContentProvider);

  async create(input: unknown): Promise<Order> {
    const orderInput = deserialize<CreateOrder>(input, { type: CreateOrder });

    try {
      await validate<CreateOrder>(serialize(orderInput), {
        type: CreateOrder
      });
    } catch {
      throw new OrderValidationError();
    }

    const catalog = await this.catalogProvider.getProducts();
    const { deliveryLocations: locations } = await this.siteContentProvider.getSiteContent();

    const deliveryLocation = locations.find((location) => location.id === orderInput.deliveryLocation);

    if (!deliveryLocation) {
      throw new OrderValidationError("Le lieu de livraison n'est pas valide.");
    }

    const deliveryDate = orderInput.targetDeliveryDate?.toISOString().slice(0, 10);

    if (deliveryLocation.fixedDeliveryDates.length > 0 && (!deliveryDate || !deliveryLocation.fixedDeliveryDates.includes(deliveryDate))) {
      throw new OrderValidationError("La date de livraison n'est pas disponible pour ce lieu.");
    }

    const quantities = new Map<string, number>();

    for (const item of orderInput.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity
      );
    }

    const items = [...quantities].map(([productId, quantity]) => {
      if (quantity > 48) {
        throw new OrderValidationError();
      }
      const product = findProduct(catalog, productId);
      if (!product) {
        throw new UnknownProductError();
      }
      return {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity,
        total: product.price * quantity
      };
    });

    const order = deserialize<Order>({
      createdAt: new Date(),
      customer: {
        firstName: orderInput.firstName.trim(),
        lastName: orderInput.lastName?.trim() || undefined,
        email: orderInput.email.trim().toLowerCase(),
        phoneNumber: orderInput.phoneNumber?.trim() || undefined
      },
      items,
      total: items.reduce((total, item) => total + item.total, 0),
      deliveryLocation: deliveryLocation.id,
      targetDeliveryDate: orderInput.targetDeliveryDate,
      status: "new"
    }, { type: Order, useAlias: false });

    const ticket = await this.orderRepository.save(order);
    order.id = ticket.id;

    await this.mailService.sendOrderConfirmation(order);

    return order;
  }
}
