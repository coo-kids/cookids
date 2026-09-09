import "@cookids/infrastructure";
import { defineFetchHandler } from "@cookids/infrastructure/http/defineFetchHandler";
import { inject } from "@tsed/di";
import { OrderService } from "@cookids/domain";
import { serialize } from "@tsed/json-mapper";

export const handleOrderRequest = defineFetchHandler({
  method: "POST",
  async handler(request) {
    const order = await inject<OrderService>(OrderService).create(await request.json());

    return Response.json({ order: serialize(order) }, { status: 201 });
  }
});
