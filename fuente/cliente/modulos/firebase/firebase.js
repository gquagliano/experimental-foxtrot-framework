/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Módulo Firebase.
 * @class
 * @extends modulo
 */
var moduloFirebase=function() {
    "use strict";

    var t=this;
    this.nombre="firebase";
    this.listo=false;
    this.inicializado=false;
    this.configuracion=null;
    this.claveMessaging=null;
    
    /**
     * Carga el SDK de Firebase en la página.
     * @param {Object} [opciones] - Opciones.
     * @param {string[]} [opciones.librerias] - Nombres de las librerías a incluir (ver
     * https://firebase.google.com/docs/web/setup#available-libraries). Por defecto, `["messaging"]`.
     * @param {Object} [opciones.config] - Configuración de Firebase (objeto con las propiedades `apiKey`, `authDomain`, `projectId`,
     * `storageBucket`, `messagingSenderId`, `appId` tal como es provisto en la consola de Firebase). Opcional; si se omite, se intentará
     * obtener desde el servidor. Si es `false` para omitir la inicialización de Firebase.
     * @param {function} [opciones.retorno] - Función de retorno.
     * @returns {moduloFirebase}
     */
    this.cargar=function(opciones) {
        if(typeof opciones=="undefined") opciones={};
        opciones=Object.assign({
            librerias:["messaging"],
            config:null,
            retorno:null
        },opciones);

        if(this.listo) return this;

        ui.cargarJs("https://www.gstatic.com/firebasejs/8.6.1/firebase-app.js",function() {
            t.cargarLibrerias(opciones.librerias,function() {
                t.listo=true;
                if(opciones.config!==false) {
                    t.configurar(opciones.config,opciones.retorno);
                } else if(opciones.retorno) {
                    opciones.retorno();
                }
            });
        });

        return this;
    };

    /**
     * Carga las librerías de Firebase.
     * @param {string[]} librerias - Nombres de las librerías. Por ejemplo `messaging`, `analytics`, etc.
     * @param {function} retorno - Función de retorno.
     * @returns {moduloFirebase}
     */
    this.cargarLibrerias=function(librerias,retorno) {
        var promesas=[];
        for(var i=0;i<librerias.length;i++) {
            (function(url) {
                promesas.push(new Promise(function(resolver,rechazar) {
                    ui.cargarJs(url,function() {
                        resolver();
                    });
                }));
            })("https://www.gstatic.com/firebasejs/8.6.1/firebase-"+librerias[i]+".js");
        }

        Promise.all(promesas)
            .then(function() {
                if(typeof retorno=="function") retorno.call(t);
            });

        return this;
    };

    /**
     * Configura el SDK de Firebase.
     * @param {Object} [config] - Configuración de Firebase (objeto con las propiedades `apiKey`, `authDomain`, `projectId`,
     * `storageBucket`, `messagingSenderId`, `appId` tal como es provisto en la consola de Firebase). Opcional; si se omite, se intentará
     * obtener desde el servidor.
     * @param {function} [retorno] - Función de retorno.
     * @returns {moduloFirebase}
     */
    this.configurar=function(config,retorno) {
        if(typeof config!="object") config=null;
        if(typeof retorno!="function") retorno=null;
        
        if(this.inicializado) return this;

        var f=function(config) {
            t.configuracion=config;
            firebase.initializeApp(config);
            t.inicializado=true;
            if(retorno) retorno();
        };

        if(!config) {
            t.servidor.obtenerConfiguracion(function(datos) {
                f(datos);
            });
        } else {
            f(config);
        }

        return this;
    };

    /**
     * Inicializa y autoriza notificaciones Push a través de FCM (Firebase Cloud Messaging) en aplicaciones Cordova.
     * @param {Object} opciones - Opciones.
     * @param {function} [opciones.retorno] - Función de retorno. Recibirá como único parámetro la clave o *token*.
     * @param {function} [opciones.error] - Función de retorno en caso de error o cancelación de la solicitud. Recibirá como único parámetro
     * el error (como cadena), `false` si fue cancelada o denegada la autorización o `null` si no fue posible iniciar el servicio.
     * @parma {function} [opciones.notificacion] - Función de retorno al recibir una notificación. Recibirá como único parámetro el objeto
     * de la notificación.
     * @returns {moduloFirebase}
     */
    this.notificacionesCordova=function(opciones) {
        //cordova-plugin-firebasex

        opciones=Object.assign({
            retorno:null,
            error:null,
            notificacion:null
        },opciones);

        if(!ui.esCordova()) return this;

        if(typeof FirebasePlugin!="object") {
            if(opciones.error) opciones.error(null);
            return this;
        }

        var obtenerToken=function() {
            FirebasePlugin.getToken(function(clave) {
                if(opciones.retorno) opciones.retorno(clave);
            }, function(error) {
                if(opciones.error) opciones.error(error);
            });
        };

        FirebasePlugin.hasPermission(function(res) {
            if(res) {
                obtenerToken();
            } else if(!requested){
                FirebasePlugin.grantPermission(function() {
                    FirebasePlugin.hasPermission(function(res) {
                        if(res) {
                            obtenerToken();
                        } else if(opciones.error) {
                            opciones.error(false);
                        }
                    });
                });
            } else if(opciones.error) {
                opciones.error(false);
            }
        });

        FirebasePlugin.onMessageReceived(function(mensaje) {
            if(mensaje.messageType!=="notification") return;
            if(opciones.notificacion) opciones.notificacion(mensaje);
        });
    
        FirebasePlugin.onTokenRefresh(function(clave) {
            if(opciones.retorno) opciones.retorno(clave);
        }, function(error) {
            if(opciones.error) opciones.error(error);
        });

        return this;
    };

    /**
     * Inicializa y autoriza notificaciones Push a través de FCM (Firebase Cloud Messaging) en el navegador web de escritorio o móvil.
     * @param {Object} opciones - Opciones.
     * @param {string} [opciones.clave] - Clave pública. Si se omite, se utilizará el parámetro `vapid` de la configuración inicial del módulo.
     * @param {function} [opciones.retorno] - Función de retorno. Recibirá como único parámetro la clave o *token*.
     * @param {function} [opciones.error] - Función de retorno en caso de error o cancelación de la solicitud.
     * @returns {moduloFirebase}
     */
    this.notificacionesWeb=function(opciones) {
        opciones=Object.assign({
            clave:this.configuracion.vapid,
            retorno:null,
            error:null
        },opciones);

        if(!this.inicializado||typeof firebase!="object"||typeof firebase.messaging!="function") {
            if(opciones.error) opciones.error(null);
            return this;
        }

        var fnError=function(error) {
        	if(opciones.error) opciones.error(error);
        };

        var messaging=firebase.messaging();
        
        navigator.serviceWorker
            .register("./servidor/modulos/firebase/sw.js")
            .then(function(sw) {  
                messaging.useServiceWorker(sw);
                messaging                    
                    .requestPermission()
                    .then(function() {
                        messaging.getToken({vapidKey:opciones.clave})
                            .then(function(token) {
                                if(!token) {
                                    if(opciones.error) opciones.error(false);
                                    return;
                                }

                                t.claveMessaging=token;
                                if(opciones.retorno) opciones.retorno(token);
                            }).catch(fnError);
                    })
		            .catch(fnError);
            })
            .catch(fnError);

        //messaging.onMessage(function(obj) {
        //    console.log(obj);
        //});

        return this;
    };

    //TODO Comprobar autorización, desuscribir    
};

ui.registrarModulo("firebase",moduloFirebase);