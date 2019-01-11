import Vue from 'vue';
import VueResource from 'vue-resource';
import VueResourceMock from 'vue-resource-mock';
import http from '../../../../app/www/components/modules/http.vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils'

//const http = shallowMount(httpVue);

var MockData = {
    ['GET */10.ms'] (pathMatch, query, request, passThrough) {
        // before respond, you can check the path and query parameters with `pathMatch` & `query`
        // powered by 'url-pattern' & 'qs'
        // https://www.npmjs.com/package/url-pattern
        // https://www.npmjs.com/package/qs
     
        // to pass through this mock, call the 4th parameter as a function, the return value will be ignored
        
        let body = { success:true }
        return {
          body: body,
          status: 200,
          statusText: 'OK',
          headers: { /*headers*/ },
          delay: 10, // millisecond
        }
    }
};

Vue.use(VueResource);
Vue.use(VueResourceMock, MockData, /* { silent: true/false } */); // after use vue-resource

// TODO: vue-resource interceptors currently can't create create delays. https://github.com/pagekit/vue-resource/issues/675
describe.skip('Http', function() {
    describe('Timout', function() {
        it('GET times out correctly if request takes longer than specified timeout', function(done) {
            http.sendRequest("GET", "10.ms", {}, false, function(err, res) {
                expect(err).to.exist;
                expect(err.status).to.equal(0);
                expect(res).to.not.exist;
                done();
            }, 5);
        });
        it('GET does not time out if request takes shorter than specified timeout', function(done) {
            http.sendRequest("GET", "10.ms", {}, false, function(err, res) {
                console.log(err, res);
                expect(err).to.not.exist;
                expect(res).to.exist;
                expect(res.success).to.be.true;
                done();
            }, 30);
        });
    });
});
