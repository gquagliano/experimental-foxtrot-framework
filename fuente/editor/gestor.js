/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @typedef Gestor
 */

/**
 * @class Gestor de aplicaciones.
 */
var gestor=new function() {
    "use strict";

    var urlOperaciones="operaciones/gestor.php",
        dialogo=null;

    /**
     * Ejecuta una operación.
     * @param {*} parametros - Parámetros.
     * @param {function} retorno - Función de retorno.
     * @returns {Gestor}
     */
    this.operacion=function(parametros,retorno) {
        this.trabajando();
        new ajax({
            url:urlOperaciones,
            parametros:parametros,
            listo:function(respuesta) {
                try {
                    respuesta=JSON.parse(respuesta);
                } catch { }

                if(respuesta&&respuesta.r=="ok") {
                    retorno(respuesta.d);
                } else {
                    ui.alerta("No fue posible seleccionar completar la operación.");
                }
            },
            error:function() {
                ui.alerta("No fue posible seleccionar completar la operación.");
            },
            siempre:function() {
                gestor.trabajando(false);
            }
        });
        return this;
    };

    /**
     * Procesa el cambio del desplegable de aplicaciones.
     * @param {HTMLSelectElement} elem 
     */
    this.aplicacionSeleccionada=function(elem) {
        this.operacion({
            seleccionarAplicacion:elem.valor()
        },function() {
            gestor.actualizar();
        });
    };

    /**
     * Abre el editor de vistas.
     * @param {string} nombreVista 
     */
    this.abrirEditor=function(nombreVista) {
        window.open("editor.php?apl="+nombreAplicacion+"&vista="+nombreVista);
    };

    /**
     * Muestra un diálogo.
     * @param {string} id - ID del elemento del diálogo.
     * @returns {Gestor}
     */
    this.abrirDialogo=function(id) {
        dialogo=ui.construirDialogo({
            cuerpo:document.querySelector("#"+id)
        });
        ui.abrirDialogo(dialogo);

        var campo=dialogo.obtenerElemento().querySelector("input,select,textarea");
        if(campo) campo.focus();

        return this;
    };

    /**
     * Cierra el diálogo abirto.
     * @returns {Gestor}
     */
    this.cerrarDialogo=function() {
        ui.cerrarDialogo(dialogo);
        return this;
    };

    /**
     * Abre el diálogo de nueva vista.
     */
    this.nuevaVista=function() {
        this.abrirDialogo("dialogo-nueva-vista");
    };

    /**
     * Acepta el diálogo de nueva vista.
     */
    this.aceptarNuevaVista=function() {
        var dialogo=document.querySelector("#dialogo-nueva-vista");

        var nombre=dialogo.querySelector("#nueva-vista-nombre").valor(),
            modo=dialogo.querySelector("#nueva-vista-modo").valor(),
            cliente=dialogo.querySelector("#nueva-vista-cliente").valor();

        if(!nombre) {
            ui.alerta("Ingresá el nombre de la vista.");
            return;
        }

        window.open("editor.php?apl="+nombreAplicacion+"&vista="+nombre+"&modo="+modo+"&cliente="+cliente);

        this.cerrarDialogo(dialogo);
    };

    /**
     * Abre el diálogo de nueva aplicación.
     */
    this.nuevaAplicacion=function() {
        this.abrirDialogo("dialogo-nueva-aplicacion");
    };

    /**
     * Acepta el diálogo de nueva aplicación.
     */
    this.aceptarNuevaAplicacion=function() {
        var nombre=document.querySelector("#nueva-aplicacion-nombre").valor();

        if(!nombre) {
            ui.alerta("Ingresá el nombre de la aplicación.");
            return;
        }

        this.operacion({
            crearAplicacion:nombre
        },function() {
            gestor.actualizar();
        });
    };

    /**
     * Abre el diálogo de nuevo controlador.
     */
    this.nuevoControlador=function() {
        this.abrirDialogo("dialogo-nuevo-controlador");
    };

    /**
     * Abre el diálogo de nuevo modelo.
     */
    this.nuevoModelo=function() {
        this.abrirDialogo("dialogo-nuevo-modelo");
    };

    /**
     * Abre el diálogo de sincronización.
     */
    this.sincronizar=function() {
        this.abrirDialogo("dialogo-sincronizacion");
    };

    /**
     * Abre el diálogo de asistentes.
     */
    this.asistentes=function() {       
        document.querySelector("#asistentes-seleccion select").valor(null); 
        document.querySelector("#asistentes-seleccion").removerClase("d-none");
        document.querySelectorAll(".formulario-asistente").agregarClase("d-none");

        this.abrirDialogo("dialogo-asistentes");
    };

    /**
     * Abre el diálogo de construir embebible.
     */
    this.construirEmbebible=function() {
        this.abrirDialogo("dialogo-construir-embebible");
    };

    /**
     * Abre el diálogo de construir producción.
     */
    this.construirProduccion=function() {
        this.abrirDialogo("dialogo-construir-produccion");
    };

    /**
     * Procesa el click en Eliminar vista.
     * @param {string} nombre - Nombre de la vista.
     */
    this.eliminarVista=function(nombre) {
        ui.confirmar("¿Estás seguro de querer eliminar la vista?",function(r) {
            if(!r) return;
            gestor.operacion({
                eliminarVista:nombre
            }, function() {
                gestor.actualizar();
            });
        });
    };    

    /**
     * Procesa el cambio del desplegable de selección de asistente.
     * @param {HTMLSelectElement} elem 
     */
    this.seleccionarAsistente=function(elem) {
        document.querySelector("#asistentes-seleccion").agregarClase("d-none");
        var formulario=document.querySelector("#asistente-"+elem.valor());
        formulario.removerClase("d-none");
        
        var campo=formulario.querySelector("input,select,textarea");
        if(campo) campo.focus();
    };

    /**
     * Recarga el gestor.
     */
    this.actualizar=function() {
        window.location.reload();
    };

    /**
     * Activa o desactiva la precarga.
     * @param {boolean} [v=true] - Activar o desactivar.
     * @returns {Gestor}
     */
    this.trabajando=function(v) {
        if(typeof v==="undefined"||v) {
            document.body.agregarClase("trabajando");
        } else {
            document.body.removerClase("trabajando");
        }
        return this;
    };
}();

window["gestor"]=gestor;
