import Vue from 'vue'
import Router from 'vue-router'


const Layout = resolve => require(['@/components/Layout'], resolve)
const LayoutFoot = resolve => require(['@/components/LayoutFoot'], resolve)

const Index = resolve => require(['@/views/Index'], resolve)



Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Layout,
      children: [{
        path: '/',
        name: 'index',
        component: Index
      }]
    },





    {
      path: '/',
      component: LayoutFoot
    }
  ]
})
