/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @typedef {aplicacion} Aplicación concreta.
 */

/**
 * Objeto base para las aplicaciones.
 * @class
 */
var aplicacion=new function() {
    "use strict";

    /**
     * @var {servidor} servidor - Acceso al controlador de servidor.
     * @var {aplicacion} prototipo - Instancia de `aplicacion`.
     */
    this.servidor=null;
    this.prototipo=this;
    
    /**
     * Devuelve la instancia del gestor de la interfaz con el servidor.
     */
    this.obtenerServidor=function() {
        return this.servidor;
    };

    /**
     * Fabrica una instancia de una aplicación concreta dada su función.
     */
    this.fabricarAplicacion=function(fn) {
        //Heredar prototipo
        fn.prototype=new (this.cttr());

        var obj=new fn;

        //Inicializar las propiedades que son objetos (de otro modo, se copiarán las referencias desde el prototipo)
        //obj.hijos=[];
        //obj.valoresPropiedades={};

        return obj;
    };

    /**
     * Inicializa la instancia.
     */
    this.inicializar=function() {
        this.inicializarAplicacion();
        return this;
    };

    /**
     * Inicializa la instancia.
     */
    this.inicializarAplicacion=function() {
        //Inicializar comunicación con el servidor
        this.servidor=servidor.fabricar();
        return this;
    };

    ////Eventos
    
    /**
     * Evento 'Inicializado'.
     */
    this.inicializado=function() {
    };
    
    /**
     * Evento 'Listo'.
     */
    this.listo=function() {
    };

    /**
     * Evento `fin`.
     */
    this.fin=function() {
    };
    
    /**
     * Evento 'Tamaño'.
     * @param {string} tamano - Tamaño actual (`'xl'`,`'lg'`,`'md'`,`'sm'`,`'xs'`).
     * @param {(string|null)} tamanoAnterior - Tamaño anterior (`'xl'`,`'lg'`,`'md'`,`'sm'`,`'xs'` o `null` si es la primer invocación al cargar la vista).
     */
    this.tamano=function(tamano,tamanoAnterior) {
    };
    
    /**
     * Evento 'Navegación'.
     * @param {string} nombreVista - Nombre de la vista de destino.
     */
    this.navegacion=function(nombreVista) {
    };
    
    /**
     * Evento 'Volver'.
     * @returns {boolean}
     */
    this.volver=function() {
    };

    /**
     * Evento 'Error Servidor'.
     */
    this.errorServidor=function() {
    };
};

window["aplicacion"]=aplicacion;
