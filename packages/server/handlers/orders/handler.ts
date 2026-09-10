import { defineFetchHandler } from "@cookids/infrastructure/http/defineFetchHandler.js";
import { inject } from "@tsed/di";
import { deserialize, serialize } from "@tsed/json-mapper";
import { OrderService } from "@cookids/domain/services/OrderService.js";
import { validate } from "@tsed/ajv";
import { Order } from "@cookids/domain/models/Order.js";
import { BadRequest } from "@tsed/exceptions";

export default defineFetchHandler({
  method: "POST",
  path: "/api/orders",
  async handler(request) {
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      throw new BadRequest("Le corps JSON est invalide.");
    }

    await validate<Order>(payload, {
      type: Order,
      groups: ["create"]
    });
    const orderInput = deserialize<Order>(payload, {
      type: Order,
      groups: ["create"],
      strictGroups: true
    });

    const order = await inject<OrderService>(OrderService).create(orderInput);

    return Response.json({ order: serialize(order, { groups: ["response"] }) }, { status: 201 });
  }
});
