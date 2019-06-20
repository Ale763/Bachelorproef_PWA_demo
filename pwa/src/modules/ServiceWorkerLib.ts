export class ServiceWorkerLib
{

	// ===================================================================================================
	// Data
	private _swPath: string;
	private _scope: string;
	private _currentWorker: any;
	private _currentRegistration: any;
	private _newWorker: any;

	constructor(swPath: string, scope: string)
	{
		this._swPath = swPath;
		this._scope = scope;
		this.register(this._swPath, this._scope)
		    .then((registration: any) =>
		          {
			          this._currentRegistration = registration;
			          this._detectNewServiceWorker();
		          })
		    .catch((err: any) =>
		           {
			           // registration failed :(
			           console.error('SW registration failed: ', err);
		           });

	}
	// ===================================================================================================
	// Getters & setters

	public getSWPath() { return this._swPath; }
	public setSWPath(value: string) { this._swPath = value; }
	public getScope() { return this._scope; }
	public setScope(value: string) { this._scope = value; }
	public getCurrentWorker() { return this._currentRegistration.active; }
	public setCurrentWorker(value: any) { this._currentWorker = value; }
	public getCurrentRegistration() { return this._currentRegistration; }
	public setCurrentRegistration(value: any) { this._currentRegistration = value; }
	public getNewWorker() { return this._newWorker; }
	public setNewWorker(value: any) { this._newWorker = value; }

	// ===================================================================================================
	// Main functions
	public register(swPath: string, scope: string)
	{
		return navigator.serviceWorker.register(swPath, {scope})
		                .then((registration: any) => { return registration})
		                .catch((error: any) => console.error(`${this._swPath} registration failed: `, error));
	}

	// public getNewWorker(registration: any)
	// {
	// 	if (registration.waiting && registration.active)
	// 	{
	// 		return registration.waiting;
	// 	} else
	// 	{
	// 		registration.addEventListener(
	// 		'updatefound',
	// 		() =>
	// 		{
	// 			return registration.installing;
	//
	//
	// 		});
	// 	}
	// }

	private _detectNewServiceWorker()
	{
		const evt = document.createEvent('Event');
		// Source: https://stackoverflow.com/questions/37573482/to-check-if-serviceworker-is-in-waiting-state
		if (this._currentRegistration.waiting && this._currentRegistration.active)
		{
			this._newWorker = this._currentRegistration.waiting;
			evt.initEvent('newSW', true, true);
			window.dispatchEvent(evt);
		} else
		{
			this._currentRegistration
			    .addEventListener('updatefound', () =>
			    {
				    this._newWorker = this._currentRegistration.installing;

				    this._newWorker
				        .addEventListener('statechange', () =>
				        {
					        // Has service worker state changed?
					        switch (this._newWorker.state)
					        {
						        case 'installed':

							        // There is a new service worker available, show the notification
							        if (navigator.serviceWorker.controller)
							        {
								        console.log('NEW SW AVAILABLE');
								        evt.initEvent('newSW', true, true);
								        document.dispatchEvent(evt);
							        }
							        break;
					        }
				        });
			    });
		}
	}

	// ===================================================================================================
	// Event listeners


	// ===================================================================================================
	// Helper functions


}

