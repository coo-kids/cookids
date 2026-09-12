import { createRouter, createWebHistory } from "vue-router";
import CheckoutPage from "./pages/CheckoutPage.vue";
import HomePage from "./pages/HomePage.vue";
import ProjectPage from "./pages/ProjectPage.vue";
import CagnottePage from "./pages/CagnottePage.vue";
import GuestbookPage from "./pages/GuestbookPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/livre-d-or", name: "guestbook", component: GuestbookPage },
    { path: "/", name: "home", component: HomePage },
    { path: "/projet", name: "project", component: ProjectPage },
    { path: "/cagnotte", name: "cagnotte", component: CagnottePage },
    { path: "/commande", name: "checkout", component: CheckoutPage },
    { path: "/:pathMatch(.*)*", redirect: { name: "home" } }
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  }
});
