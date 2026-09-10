import { defineFetchHandler } from "@cookids/infrastructure/http/defineFetchHandler";
import { inject } from "@tsed/di";
import { serialize } from "@tsed/json-mapper";
import { OrderService } from "@cookids/domain/services/OrderService.js";

export default defineFetchHandler({
  method: "POST",
  path: "/api/orders",
  async handler(request) {
    const order = await inject(OrderService).create(await request.json());

    return Response.json({ order: serialize(order) }, { status: 201 });
  }
});
