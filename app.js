"use strict";

// --- بيانات المستخدم (معرف مستخدم عشوائي) ---
const USER_ID_KEY = "billingAppUserId";
let userId = localStorage.getItem(USER_ID_KEY);
if (!userId) {
  userId = "user-" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem(USER_ID_KEY, userId);
}

// --- مفاتيح التخزين ---
const CLIENTS_KEY = `clients_${userId}`;

// --- العناصر ---
const screens = {
  home: document.getElementById("home-screen"),
  clients: document.getElementById("clients-screen"),
  clientDetails
