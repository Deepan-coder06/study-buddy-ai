"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.updateUserProfile = exports.githubProvider = exports.googleProvider = exports.db = exports.auth = void 0;
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
// Firebase Configuration - Replace with your actual Firebase config from https://console.firebase.google.com
var firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB5wdHodBNUcUhP64Im_kcsz6H7WlMKVmA",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "study-buddy-ai-default.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "study-buddy-ai",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "study-buddy-ai.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "566831257979",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:566831257979:web:abcdef123456"
};
// Initialize Firebase
var app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
exports.auth = (0, auth_1.getAuth)(app);
// Initialize Cloud Firestore and get a reference to the service
exports.db = (0, firestore_1.getFirestore)(app);
// Configure Google Provider
exports.googleProvider = new auth_1.GoogleAuthProvider();
exports.googleProvider.addScope('profile');
exports.googleProvider.addScope('email');
// Configure GitHub Provider
exports.githubProvider = new auth_1.GithubAuthProvider();
exports.githubProvider.addScope('user:email');
var updateUserProfile = function (userId, name, email) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(exports.db, "users", userId), {
                        name: name,
                        email: email,
                    })];
            case 1:
                _a.sent();
                console.log("User data saved to Firestore");
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Error saving user data to Firestore: ", error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateUserProfile = updateUserProfile;
var getUserProfile = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var docRef, docSnap, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                docRef = (0, firestore_1.doc)(exports.db, "users", userId);
                return [4 /*yield*/, (0, firestore_1.getDoc)(docRef)];
            case 1:
                docSnap = _a.sent();
                if (docSnap.exists()) {
                    return [2 /*return*/, docSnap.data()];
                }
                else {
                    console.log("No such document!");
                    return [2 /*return*/, null];
                }
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error("Error getting user data from Firestore: ", error_2);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getUserProfile = getUserProfile;
exports.default = app;
