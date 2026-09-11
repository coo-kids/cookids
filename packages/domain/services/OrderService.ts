import { context, inject, Injectable } from "@tsed/di";
import { CatalogProvider } from "../catalog/CatalogProvider.js";
import { DeliveryLocationProvider } from "../content/DeliveryLocationProvider.js";
import { MailService } from "../mail/MailService.js";
import { Order } from "../models/Order.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
import { OrderValidationError } from "@cookids/domain/errors/OrderValidationError.js";

@Injectable()
export class OrderService {
  private readonly orderRepository = inject<OrderRepository>(OrderRepository);
  private readonly mailService = inject<MailService>(MailService);
  private readonly catalogProvider = inject<CatalogProvider>(CatalogProvider);
  private readonly deliveryLocationProvider = inject<DeliveryLocationProvider>(DeliveryLocationProvider);

  async create(orderInput: Order): Promise<Order> {
    const logger = context().logger;

    logger.info({
      event: "order.create.start",
      delivery_location: orderInput.deliveryLocation,
      item_count: orderInput.items.length
    });

    await this.checkLocation(orderInput);
    await this.resolveProducts(orderInput);

    const ticket = await this.orderRepository.save(orderInput);
    orderInput.id = ticket.id;
    logger.info({ event: "order.create.saved", order_id: orderInput.id });

    try {
      await this.mailService.sendOrderConfirmation(orderInput);
      logger.info({ event: "order.confirmation.sent", order_id: orderInput.id });
    } catch (error) {
      const emailError = error instanceof Error ? error : new Error(String(error));

      logger.warn({
        event: "order.confirmation.failed",
        order_id: orderInput.id,
        erreur_name: emailError.name,
        erreur_message: emailError.message,
        stack: emailError.stack
      });
    }

    return orderInput;
  }

  protected async checkLocation(orderInput: Order) {
    const locations = await this.deliveryLocationProvider.getDeliveryLocations();

    const deliveryLocation = locations.find((location) => location.id === orderInput.deliveryLocation);

    if (!deliveryLocation) {
      throw new OrderValidationError("Le lieu de livraison n'est pas valide.");
    }

    const deliveryDate = orderInput.targetDeliveryDate?.toISOString().slice(0, 10);

    if (deliveryLocation.fixedDeliveryDates.length > 0 && (!deliveryDate || !deliveryLocation.fixedDeliveryDates.includes(deliveryDate))) {
      throw new OrderValidationError("La date de livraison n'est pas disponible pour ce lieu.");
    }
  }

  protected async resolveProducts(order: Order) {
    const catalog = await this.catalogProvider.getProducts();

    for (const item of order.items) {
      const product = catalog.find((product) => product.id === item.productId);

      if (!product) {
        throw new OrderValidationError("Un produit demandé n'existe pas.");
      }

      item.setProduct(product);
    }
  }
}
