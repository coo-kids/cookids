import { defineHandler } from "@cookids/infrastructure";
import { inject } from "@tsed/di";
import { OrderService } from "@cookids/domain";
import { serialize } from "@tsed/json-mapper";

export default defineHandler({
  method: "POST",
  async handler(request) {
    const order = await inject(OrderService).create(request.body);

    return Response.json({ order: serialize(order) }, { status: 201 });
  }
});

