import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
        },
        {
            path: "/add-product",
            name: "add-product",
            component: () => import("@/components/TambahProduk.vue"),
        },
        {
            path: "/login",
            name: "login",
            component: () => import("@/components/Login.vue"),
        },
        {
            path: "/signup",
            name: "signup",
            component: () => import("@/components/Register.vue"),
        },
        {
            path: "/list-products",
            name: "list-products",
            component: () => import("@/views/DaftarProduk.vue"),
        },
        {
            path: "/update-product",
            name: "update-product",
            component: () => import("@/components/UpdateProduk.vue"),
        },
        {
            path: "/reports",
            name: "reports",
            component: () => import("@/views/InvenReport.vue"),
        },
    ],
});

export default router;
