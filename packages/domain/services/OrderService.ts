import "@tsed/ajv";
import { AjvService } from "@tsed/ajv";
import { inject, Injectable } from "@tsed/di";
import { deserialize } from "@tsed/json-mapper";
import { CatalogProvider } from "../catalog/CatalogProvider.js";
import { CreateOrder } from "../dto/CreateOrder.js";
import { OrderValidationError } from "../errors/OrderValidationError.js";
import { UnknownProductError } from "../errors/UnknownProductError.js";
import { MailService } from "../mail/MailService.js";
import type { Order } from "../models/Order.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
import { createOrderId } from "../utils/createOrderId.js";
import { findProduct } from "../utils/findProduct.js";

@Injectable()
export class OrderService {
  private readonly orderRepository = inject(OrderRepository);
  private readonly mailService = inject(MailService);
  private readonly ajvService = inject(AjvService);
  private readonly catalogProvider = inject(CatalogProvider);

  async create(input: unknown): Promise<Order> {
    const orderInput = deserialize<CreateOrder>(input, { type: CreateOrder });
    try {
      await this.ajvService.validate<CreateOrder>(orderInput, { type: CreateOrder });
    } catch {
      throw new OrderValidationError();
    }
    const catalog = await this.catalogProvider.getProducts();
    const quantities = new Map<string, number>();
    for (const item of orderInput.items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
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
        unitPriceCents: product.priceCents,
        quantity,
        totalCents: product.priceCents * quantity
      };
    });

    const order: Order = {
      id: createOrderId(),
      createdAt: new Date(),
      customer: {
        name: orderInput.name.trim(),
        email: orderInput.email.trim().toLowerCase(),
        phone: orderInput.phone?.trim() || undefined
      },
      comment: orderInput.comment?.trim() || undefined,
      items,
      totalCents: items.reduce((total, item) => total + item.totalCents, 0),
      status: "new"
    };

    await this.orderRepository.save(order);
    await this.mailService.sendOrderConfirmation(order);
    return order;
  }
}
