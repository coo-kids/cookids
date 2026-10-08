import { context, inject, Injectable } from "@tsed/di";
import { CatalogProvider } from "../catalog/CatalogProvider.js";
import { DeliveryLocationProvider } from "../content/DeliveryLocationProvider.js";
import { MailService } from "../mail/MailService.js";
import { Order } from "../models/Order.js";
import { OrderRepository } from "../repositories/OrderRepository.js";
import { OrderValidationError } from "@cookids/domain/errors/OrderValidationError.js";
import type { ContentCatalog } from "../schemas/ContentCatalogSchema.js";

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
    const catalog = await this.catalogProvider.getCatalog();

    this.checkParticipantLabels(order);

    for (const item of order.items) {
      const product = catalog.products.find((product) => product.id === item.productId);

      if (!product) {
        throw new OrderValidationError("Un produit demandé n'existe pas.");
      }

      this.checkToppings(item, product);

      item.setProduct(product);
    }

    this.checkProductQuantityMultiples(order, catalog);
    this.checkProductMinimumQuantities(order, catalog);
    this.checkCategoryQuantityMultiples(order, catalog);
  }

  protected checkParticipantLabels(order: Order) {
    const hasGroupedItem = order.items.some((item) => item.participantLabel !== undefined);

    if (hasGroupedItem && order.items.some((item) => !item.participantLabel?.trim())) {
      throw new OrderValidationError("Chaque article d'une commande groupée doit être associé à un participant.");
    }
  }

  protected checkToppings(item: Order["items"][number], product: ContentCatalog["products"][number]) {
    const toppingIds = item.toppingIds ?? [];
    const availableToppings = product.availableToppings ?? [];

    if (availableToppings.length === 0 && toppingIds.length > 0) {
      throw new OrderValidationError("Ce produit ne peut pas être personnalisé.");
    }
    if (availableToppings.length === 0) return;

    const minimum = product.minimumToppings ?? 1;
    const maximum = product.maximumToppings ?? availableToppings.length;
    const uniqueIds = new Set(toppingIds);
    const allowedIds = new Set(availableToppings.map((topping) => topping.id));

    if (uniqueIds.size !== toppingIds.length || toppingIds.length < minimum || toppingIds.length > maximum || toppingIds.some((id) => !allowedIds.has(id))) {
      throw new OrderValidationError(`Choisissez entre ${minimum} et ${maximum} toppings autorisés.`);
    }
  }

  protected checkProductQuantityMultiples(order: Order, catalog: ContentCatalog) {
    for (const item of order.items) {
      const product = catalog.products.find((product) => product.id === item.productId);

      if (product?.quantityMultiple && item.quantity % product.quantityMultiple !== 0) {
        throw new OrderValidationError(
          `« ${product.name} » doit être commandé par multiple de ${product.quantityMultiple}.`,
        );
      }
    }
  }

  protected checkProductMinimumQuantities(order: Order, catalog: ContentCatalog) {
    for (const product of catalog.products) {
      if (!product.minimumQuantity) continue;
      const quantity = order.items.reduce(
        (total, item) => total + (item.productId === product.id ? item.quantity : 0), 0,
      );

      if (quantity > 0 && quantity < product.minimumQuantity) {
        throw new OrderValidationError(
          `« ${product.name} » doit être commandé en quantité minimale de ${product.minimumQuantity}.`,
        );
      }
    }
  }

  protected checkCategoryQuantityMultiples(order: Order, catalog: ContentCatalog) {
    for (const category of catalog.categories) {
      if (!category.quantityMultiple) continue;

      const categoryProductIds = new Set(
        catalog.products
          .filter((product) => product.category === category.id)
          .map((product) => product.id),
      );
      const quantity = order.items.reduce(
        (total, item) => total + (categoryProductIds.has(item.productId) ? item.quantity : 0),
        0,
      );

      if (quantity > 0 && quantity % category.quantityMultiple !== 0) {
        throw new OrderValidationError(
          `La quantité pour la catégorie « ${category.label} » doit être un multiple de ${category.quantityMultiple}.`,
        );
      }
    }
  }
}
