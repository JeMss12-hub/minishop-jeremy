<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <img slot="start" src="/logo.svg" alt="Mini Shop logo" class="page-logo" />
        <ion-title>Sales</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <section class="page-intro">
        <p>SALES TRACKER</p>
        <h1>Record every sale</h1>
        <span>{{ sales.length }} sale{{ sales.length === 1 ? '' : 's' }} recorded</span>
      </section>

      <ion-card class="sale-card">
        <ion-card-header>
          <ion-card-title>{{ editingSale ? 'Edit Sale' : 'New Sale' }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label position="stacked">Customer name</ion-label>
            <input v-model="form.customerName" class="native-input" placeholder="Walk-in customer" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Product or service</ion-label>
            <input v-model="form.productName" class="native-input" placeholder="Product name" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Quantity</ion-label>
            <input v-model="form.quantity" class="native-input" type="number" min="1" placeholder="1" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Total amount</ion-label>
            <input v-model="form.total" class="native-input" type="number" min="0" step="0.01" placeholder="0.00" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Payment method</ion-label>
            <select v-model="form.paymentMethod" class="native-input">
              <option>Cash</option>
              <option>GCash</option>
              <option>Bank transfer</option>
              <option>Card</option>
            </select>
          </ion-item>
          <ion-item v-if="editingSale">
            <ion-label position="stacked">Status</ion-label>
            <select v-model="form.status" class="native-input">
              <option v-for="status in statuses" :key="status">{{ status }}</option>
            </select>
          </ion-item>

          <ion-button expand="block" class="ion-margin-top" :disabled="isSaving" @click="saveSale">
            {{ isSaving ? 'Saving sale...' : editingSale ? 'Save Changes' : 'Record Sale' }}
          </ion-button>
          <ion-button v-if="editingSale" expand="block" fill="clear" @click="resetForm">Cancel</ion-button>
        </ion-card-content>
      </ion-card>

      <ion-list v-if="sales.length" class="sales-list">
        <ion-item v-for="sale in sales" :key="sale.id">
          <ion-label>
            <h2>{{ sale.productName }}</h2>
            <p>{{ sale.customerName }} · {{ sale.quantity }} item{{ sale.quantity === 1 ? '' : 's' }}</p>
            <ion-badge :color="statusColor(sale.status)">{{ sale.status }}</ion-badge>
          </ion-label>
          <div slot="end" class="sale-actions">
            <strong>₱{{ sale.total.toFixed(2) }}</strong>
            <ion-button fill="clear" size="small" @click="startEdit(sale)">Edit</ion-button>
            <ion-button fill="clear" color="danger" size="small" @click="deleteSale(sale)">Delete</ion-button>
          </div>
        </ion-item>
      </ion-list>
      <ion-text v-else color="medium">
        <p class="empty-state">No sales yet. Record your first sale above.</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { db } from '../firebase/config';
import type { Sale, SaleStatus } from '../models/sale';

const statuses: SaleStatus[] = ['Pending', 'Paid', 'Completed', 'Cancelled'];
const sales = ref<Sale[]>([]);
const editingSale = ref<Sale | null>(null);
const isSaving = ref(false);
const form = ref({
  customerName: '',
  productName: '',
  quantity: '1',
  total: '0',
  paymentMethod: 'Cash',
  status: 'Paid' as SaleStatus
});

onMounted(() => onSnapshot(collection(db, 'sales'), (snapshot) => {
  sales.value = snapshot.docs
    .map(item => ({ id: item.id, ...item.data() }) as Sale)
    .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')));
}));

const resetForm = () => {
  editingSale.value = null;
  form.value = { customerName: '', productName: '', quantity: '1', total: '0', paymentMethod: 'Cash', status: 'Paid' };
};

const startEdit = (sale: Sale) => {
  editingSale.value = sale;
  form.value = {
    customerName: sale.customerName,
    productName: sale.productName,
    quantity: String(sale.quantity),
    total: String(sale.total),
    paymentMethod: sale.paymentMethod,
    status: sale.status
  };
};

const saveSale = async () => {
  const customerName = form.value.customerName.trim() || 'Walk-in customer';
  const productName = form.value.productName.trim();
  const quantity = Number(form.value.quantity);
  const total = Number(form.value.total);

  if (!productName || !Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(total) || total < 0) {
    alert('Enter a product, a whole-number quantity, and a valid total amount.');
    return;
  }

  isSaving.value = true;
  try {
    const saleData = {
      customerName,
      productName,
      quantity,
      total,
      paymentMethod: form.value.paymentMethod,
      status: form.value.status
    };
    if (editingSale.value?.id) {
      await updateDoc(doc(db, 'sales', editingSale.value.id), saleData);
    } else {
      await addDoc(collection(db, 'sales'), { ...saleData, createdAt: new Date().toISOString() });
    }
    resetForm();
  } catch (error) {
    console.error('Unable to save sale:', error);
    alert('Could not save the sale. Please try again.');
  } finally {
    isSaving.value = false;
  }
};

const deleteSale = async (sale: Sale) => {
  if (!sale.id || !confirm(`Delete the sale for ${sale.productName}?`)) return;
  await deleteDoc(doc(db, 'sales', sale.id));
  if (editingSale.value?.id === sale.id) resetForm();
};

const statusColor = (status: SaleStatus) => ({
  Pending: 'warning',
  Paid: 'primary',
  Completed: 'success',
  Cancelled: 'danger'
}[status]);
</script>

<style scoped>
.page-logo { border-radius: 9px; height: 32px; margin-left: 12px; width: 32px; }
.page-intro { padding: 18px 8px 22px; }
.page-intro p { color: #1769ff; font-size: .7rem; font-weight: 800; letter-spacing: .13em; margin: 0 0 7px; }
.page-intro h1 { color: #101b33; font-size: 1.8rem; letter-spacing: -.035em; margin: 0 0 6px; }
.page-intro span { color: #667085; }
.sale-card, .sales-list { border: 1px solid #e1e8f2; border-radius: 20px; }
.sale-card { --background: #fff; box-shadow: 0 12px 26px rgba(24, 46, 89, .09); }
.sale-card ion-item { --background: transparent; --border-color: #edf0f5; --padding-start: 0; --inner-padding-end: 0; }
.native-input { background: #f8faff; border: 1px solid #d9e2f0; border-radius: 10px; color: #15233d; margin: 7px 0 10px; padding: 10px; box-sizing: border-box; font: inherit; width: 100%; }
.sales-list { background: #fff; box-shadow: 0 8px 21px rgba(24, 46, 89, .05); overflow: hidden; }
.sales-list ion-item { --background: #fff; --border-color: #edf0f5; --padding-bottom: 7px; --padding-top: 7px; }
.sales-list h2 { color: #15233d; font-size: .98rem; font-weight: 750; }
.sales-list p { color: #65718a; font-size: .82rem; margin: 4px 0 7px; }
.sale-actions { align-items: flex-end; display: flex; flex-direction: column; }
.sale-actions strong { color: #101b33; font-size: .95rem; }
.sale-actions ion-button { font-size: .72rem; }
.empty-state { color: #65718a; padding: 56px 20px; text-align: center; }
</style>
