import {
    $normal,
    $reactive,
    CODE_VIEW,
    FORM_VIEW,
    handleRecoverLiteShow,
    LIST_VIEW,
    switchToFullUIMode
} from "../js/store";
import {createRouter, createWebHashHistory} from 'vue-router'
import ListView from "../view/ListView.vue";

/**
 * @type Array<import('vue-router').RouteRecordRaw>
 */
const routes = [
    {
      path:'/',
      redirect: '/list/0'
    },
    {
        name: 'list',
        path: '/list/:count',
        component: ListView,
        meta:{
            ban: false
        }
    },
    {
        name: 'code',
        path: '/code',
        component: ()=> import('../view/CodeView.vue'),
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
    routes: routes
})


router.beforeResolve((to,from)=>{
    if(to.name === 'list'){
        $reactive.currentMode = LIST_VIEW
        console.log('enter listview')
        handleRecoverLiteShow();
    }else{
        $reactive.currentMode = (to.name==='code'? CODE_VIEW:FORM_VIEW)
        switchToFullUIMode();
    }
})

/**
 *
 * @param {boolean} [refresh]
 */
function switchToListView(refresh){
    if(refresh){
        ++$normal.listViewVisitedCount;
    }
    router.replace('/list/'+$normal.listViewVisitedCount)
}


export {
    router,switchToListView
}