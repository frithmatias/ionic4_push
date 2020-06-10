import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';
@Injectable({
	providedIn: 'root'
})
export class PushService {
	// Lo demajos como ANY y no como OSNotification para evitar problemas al probar localmente.
	// mensajesPush: any[] = [ { title: 'Titlo del push', body: 'Body del push', date: new Date() } ];
	// ahora que ya voy a guardar los mensajes desde el payload, puedo quitar este array tipo any y crear
	// uno vacío tipo OSNotificationPayload
	mensajesPush: OSNotificationPayload[] = [];
	pushListener = new EventEmitter<OSNotificationPayload>();
	userId: string;

	// Vamos a Emitir un OSNotificationPayload cuando yo recibo la notificacion.

	constructor(private oneSignal: OneSignal, private storage: Storage) {
		this.cargarStorage();
	}

	configuracionInicial() {
		// (appId: string, googleProjectNumber?: string)
		// Yo ya tengo una app creada en oneSignal de notificaciones, voy a usar esa para obtener esta info

		// ONESIGNAL -> https://app.onesignal.com/apps/
		//    voy a la app PushApp -> Settings -> Keys & IDs
		//    ONESIGNAL APP ID
		//    32f2775f-bba7-4cd5-9f26-ccf93539bcba
		//    REST API KEY
		//    OTAxN2Q4NTMtZWNlNi00NjNiLWI3YzQtYjNjMWNjNGVhYmMz

		// FIREBASE -> https://console.firebase.google.com/u/0/project/pushapp-c0cec/settings/cloudmessaging/
		//    Engranaje -> Configuración del proyecto -> Mensajería en la nube -> ID del remitente
		//    ID del remitente: 866728031609

		this.oneSignal.startInit('32f2775f-bba7-4cd5-9f26-ccf93539bcba', '866728031609');

		// this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
		this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

		this.oneSignal.handleNotificationReceived().subscribe((notif) => {
			// do something when notification is received
			console.log('notificación recibida', notif);
			// {isAppInFocus: true, shown: true, androidNotificationId: 394760564, displayType: 0, payload: {…}}
			// 		androidNotificationId: 394760564
			// 		displayType: 0
			// 		isAppInFocus: true
			// 		payload: {notificationID: "17c15...8277a7", title: "1111", body: "11111", additionalData: {…}, lockScreenVisibility: 1, …}
			// 		shown: true
			this.notificacionRecibida(notif); // aca ya sabe por el meotodo al cual esta subscripto, que el tipo es OSNotification
		});

		// como tenemos aprox 20 o 30 seg antes de que la aplicación pase a segundo plano una vez que tocamos la notificación, el
		// plugin de OneSignal le dice a la app que ya termino de procesar el código y que ya puede cerrarse, para eso vamos a
		// decirle que espere con async para que devuelve una promesa.

		// this.oneSignal.handleNotificationOpened().subscribe(async (notif) => {

		// 	// do something when a notification is opened
		// 	console.log('notificación abierta', notif);

		// 	// action: {type: 0}
		// 	// notification:
		// 	// 		androidNotificationId: -2028561945
		// 	// 		displayType: 0
		// 	// 		isAppInFocus: false
		// 	// 		payload: {notificationID: "9e3c84d8...1e0", title: "asdfasdf", body: "asdfasdf", additionalData: {…}, lockScreenVisibility: 1, …}
		// 	// 		shown: true

		// 	// le mando la notificacion recibida.
		// 	await this.notificacionRecibida(notif.notification);
		// });

		// Antes de que finalice la inicialización obtnego el ID del suscriptor.
		this.oneSignal.getIds().then((info) => {
			this.userId = info.userId;
			console.log('userId: ', this.userId);
		});

		this.oneSignal.endInit();
	}

	// el tipo que recibe la notificacion es OSNotification de OneSignal
	notificacionRecibida(notif: OSNotification) {
		// modo paranoico los cargo otra vez por las dudas, para eso declaro el metodo async y uso await
		// para esperar que carguen los mensajes.
		// await this.cargarStorage();

		const existePush = this.mensajesPush.find((mensaje) => mensaje.notificationID === notif.payload.notificationID);
		if (existePush) {
			return;
		}

		// Guardo la notificación en mi array.
		this.mensajesPush.unshift(notif.payload);
		console.log('Array de mensajes: ', this.mensajesPush);

		// Guardo la notificación en el Storage.
		this.guardarStorage();

		const mensajesSt = this.storage.get('payload');
		console.log('Mensajes en el storage desde el storage', mensajesSt);

		this.pushListener.emit(notif.payload);
	}

	// async getMensajesPush() {
	// 	await this.cargarStorage();
	// 	return [ ...this.mensajesPush ];
	// }

	guardarStorage() {
		this.storage.set('payload', this.mensajesPush);
	}

	async cargarStorage() {
		// para borrar todos los mensajes en el storage
		// this.storage.clear();
		this.mensajesPush = (await this.storage.get('payload')) || [];
		return this.mensajesPush;
	}

	borrarMensajes() {
		this.storage.clear();
		// this.storage.remove('mensajes');
		this.mensajesPush = [];
		// this.guardarStorage();
	}
}
