import VueResource from 'vue-resource';
import App from './../components/pages/App.vue';
import LoginPage from './../components/pages/login-page.vue';
import RegistrationPage from './../components/pages/registration-page.vue';
import DashboardPage from './../components/pages/dashboard-page.vue';

Vue.use(VueMaterial.default);
Vue.use(VueResource);
Vue.use(VueRouter);

// for session
Vue.http.options.credentials = true;

// the router
var router = new VueRouter({
    routes: [{
            path: '/',
            component: LoginPage
        },
        {
            path: '/register',
            component: RegistrationPage
        },
        {
            path: '/dashboard',
            component: DashboardPage
        }
    ]
});

// the vue instance
var vm = new Vue({
    el: '#app',
    components: {
        'app': App,
        'login-page': LoginPage,
        'registration-page': RegistrationPage,
        'dashboard-page': DashboardPage
    },
    router: router,
    render: function (h) {
        return h(App);
    }
});