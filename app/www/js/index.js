import VueResource from 'vue-resource';
import EventBus from './../components/modules/event.vue';
import App from './../components/pages/App.vue';
import LoginPage from './../components/pages/login-page.vue';
import RegistrationPage from './../components/pages/registration-page.vue';
import DashboardPage from './../components/pages/dashboard-page.vue';
import SettingsPage from './../components/pages/settings-page.vue';

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
        },
        {
            path: '/settings',
            component: SettingsPage
        }
    ]
});

// the vue instance
var vm = new Vue({
    el: '#app',
    data() {
        return {
            deviceReady: false
        };
    },
    components: {
        'app': App,
        'login-page': LoginPage,
        'registration-page': RegistrationPage,
        'dashboard-page': DashboardPage,
        'settings-page': SettingsPage
    },
    router: router,
    render: function (h) {
        return h(App);
    }
});

// apply event listener for cordova device
document.addEventListener('deviceready', function() {
    vm.deviceReady = true;
    EventBus.$emit('deviceReady');
});