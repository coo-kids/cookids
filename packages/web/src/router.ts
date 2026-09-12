import { createRouter, createWebHistory } from "vue-router";
import CheckoutPage from "./pages/CheckoutPage.vue";
import HomePage from "./pages/HomePage.vue";
import ProjectPage from "./pages/ProjectPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomePage },
    { path: "/projet", name: "project", component: ProjectPage },
    { path: "/commande", name: "checkout", component: CheckoutPage },
    { path: "/:pathMatch(.*)*", redirect: { name: "home" } }
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  }
});
