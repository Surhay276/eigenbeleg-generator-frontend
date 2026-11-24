import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import ReceiptForm from '../components/ReceiptForm.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'receipts', component: App },
    {
      // /belege/neu?typ=ankauf zeigt den Ankaufbeleg, alles andere den allgemeinen Eigenbeleg (UC-03, UC-04)
      path: '/belege/neu',
      name: 'new-receipt',
      component: ReceiptForm,
      props: (route) => ({ type: route.query.typ === 'ankauf' ? 'ANKAUF' : 'ALLGEMEIN' }),
    },
  ],
})
