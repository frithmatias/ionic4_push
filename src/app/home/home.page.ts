import { Component, OnInit, ApplicationRef } from '@angular/core';
import { PushService } from '../services/push.service';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: [ 'home.page.scss' ]
})
export class HomePage implements OnInit {
	constructor(public pushService: PushService, private applicationRef: ApplicationRef) {}

	ngOnInit() {
		// Nos subscribimos al listener del servicio que emite cuando llega una notificación.
		this.pushService.pushListener.subscribe((notif) => {
			console.log('Se recibio un nuevo evento en el componente:', notif);

			// esto debería funcionar, pero por alguna razón no recibe el evento del EventEmitter. Para eso
			// inyecto el aplicationRef. Vamos a usar el evento tick() que es raro usarlo pero en este caso lo
			// vamos a necesitar, y le pide a angular que ejecute el ciclo de detección de cambios nuevamente.
			this.applicationRef.tick();
		});
	}

	// voy a cargar los mensajes, por si la aplicación vuelve despues de estar inactiva.
	// async ionViewWillEnter() {
	// 	this.pushService.mensajesPush = await this.pushService.getMensajesPush();
	// 	console.log('ionViewWillEnter mensajesPush:', this.pushService.mensajesPush);
	// }

	// implementamos el metodo borrarMensajes();
	borrarMensajes() {
		this.pushService.borrarMensajes();
	}
}
