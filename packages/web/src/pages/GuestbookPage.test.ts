import { mount, flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuestbookPage from "./GuestbookPage.vue";
afterEach(() => vi.unstubAllGlobals());
describe("GuestbookPage", () => {
  it("affiche le formulaire avant les avis et n’interprète jamais le HTML", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ entries: [{ author: "<b>Alice</b>", comment: '<img src=x onerror=alert(1)>' }] })));
    const wrapper = mount(GuestbookPage);
    await flushPromises();
    expect(wrapper.find("article img").exists()).toBe(false);
    expect(wrapper.get("article").text()).toContain("<img src=x onerror=alert(1)>");
    expect(wrapper.html().indexOf("<form")).toBeLessThan(wrapper.html().indexOf("<article"));
    expect(wrapper.get("article p:last-child").classes()).toContain("text-right");
  });
  it("soumet un avis et explique la modération", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(Response.json({ entries: [] })).mockResolvedValueOnce(Response.json({ accepted: true }, { status: 201 }));
    vi.stubGlobal("fetch", fetch);
    const wrapper = mount(GuestbookPage);
    await flushPromises();
    await wrapper.get("#guest-author").setValue("Alice");
    await wrapper.get("#guest-comment").setValue("Merci !");
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ author: "Alice", comment: "Merci !", website: "" });
    expect(wrapper.get('[role="status"]').text()).toContain("après validation");
  });
});
