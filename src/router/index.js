import {$reactive, CODE_VIEW, FORM_VIEW, handleRecoverLiteShow, LIST_VIEW, switchToFullUIMode} from "../js/store";
import {createRouter, createWebHashHistory} from 'vue-router'
import ListView from "../view/ListView.vue";
import {gotoTheLastPosition} from "../js/utils/scroller";

/**
 * @type Array<import('vue-router').RouteRecordRaw>
 */
const routes = [
    {
        name: 'list',
        path: '/',
        component: ListView,
        alias: '/list',
        meta:{
            ban: false
        }
    },
    {
        name: 'code',
        path: '/code/:name',
        component: ()=> import('../view/CodeView.vue'),
        props: true,
        meta:{
            ban: false
        }
    },
    {
        name: 'form',
        path: '/form',
        component: () => import('../view/FormView.vue'),
        meta:{
            ban: true
        }
    }
]



const router = createRouter({
    history: createWebHashHistory(),
    routes: routes,
    scrollBehavior(to,from){
        if(to.name === 'list'){
            setTimeout(()=>{
                gotoTheLastPosition(true);
            },100)
        }
    }
})


router.afterEach((to,from)=>{
    if(to.name === 'list'){
        console.log('enter listview')
        handleRecoverLiteShow();
        $reactive.currentMode = LIST_VIEW
    }else{
        switchToFullUIMode();
        $reactive.currentMode = (to.name==='code'? CODE_VIEW:FORM_VIEW)
    }
})


export {
    router
}