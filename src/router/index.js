import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/components/Login";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        redirect: "/login"
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: "/home",
        component: () => import("../components/Home"),
        redirect: "/welcome",
        children: [
            {
                path: "/welcome",
                component: () => import("../pages/Welcome")
            },
            {
                path: "/users",
                component: () => import("../pages/Users")
            }, {
                path: "/rights",
                component: () => import("../pages/Rights")
            }, {
                path: "/roles",
                component: () => import("../pages/Roles")
            },
            {
                path: "/users",
                component: () => import("../pages/Users")
            }, {
                path: "/params",
                component: () => import("../pages/Params")
            },
            {
                path: "/goods",
                component: () => import("../pages/Goods")
            },
            {
                path: "/categories",
                component: () => import("../pages/Categories")
            },
            {
                path: "/orders",
                component: () => import("../pages/Orders")
            },
            {
                path: "/goods/add",
                component: () => import("../pages/AddGoods")
            },
            {
                path:"/goods/edit/:id",
                component:() => import("../pages/EditGoods")
            }
        ]
    }
]

const router = new VueRouter({
    mode: "history",
    routes
});

export default router;