/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Diálogo (pop-up).
 * @class
 * @extends componente
 */
var componenteDialogo=function() { 
    "use strict";

    var t=this;
    
    this.componente="dialogo";    

    this.propiedadesConcretas={
        "Diálogo":{
            modal:{
                etiqueta:"Modal",
                tipo:"logico",
                adaptativa:false
            },
            ocultarIconoCerrar:{
                etiqueta:"Ocultar ícono de cierre",
                tipo:"logico",
                adaptativa:false,
                evaluable:true
            }
        }
    };

    var dialogo=null;

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.contenedor=this.elemento;

        this.prototipo.inicializar.call(this);

        //Remover la clase 'dialogo' (agregada por inicializarComponente) ya que es solo el cuerpo; ui.construirDialogo() va a
        //insertar el elemento dentro de un <div class='dialogo'>
        this.elemento.removerClase("dialogo");

        this.clasesCss.push("contenido-componente-dialogo");

        return this;
    };
   
    /**
     * Actualiza el componente tras modificarse el valor de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(!ui.enModoEdicion()||!expresion.contieneExpresion(valor)) {
	        if(propiedad=="modal"||propiedad=="ocultarIconoCerrar") {
	            //Destruir para que se reconstruya con los nuevos valores al abrir
	            if(dialogo) {
	                ui.eliminarDialogo(dialogo);
	                dialogo=null;
	            }
	        }
	    }
            
        return this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='contenido-componente-dialogo'>"); 
        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Devuelve `true` si el diálog se encuentra actualmente abierto.
     * @returns {boolean}
     */
    this.abierto=function() {
        return dialogo&&dialogo.abierto;
    };

    /**
     * Abre el diálogo.
     * @param {function} [retorno] - Función de retorno al cerrar el diálogo.
     * @returns Componente
     */
    this.abrir=function(retorno) {
        if(typeof retorno!=="function") retorno=null;
        
        if(!dialogo) {
            dialogo=ui.construirDialogo({
                cuerpo:this.elemento,
                mostrarCerrar:!this.propiedad("ocultarIconoCerrar"),
                modal:this.propiedad("modal"),
                retornoAbierto:function() {
                    ui.autofoco(t.elemento);
                    if(retorno) retorno();
                }
            });
            //Como el cuerpo del diálgo será movido en el DOM, registrar este componente en la vista
            this.vista.agregarComponente(this);
        }

        ui.abrirDialogo(dialogo);
    };

    /**
     * Cierra el diálogo.
     * @returns Componente
     */
    this.cerrar=function() {
        ui.cerrarDialogo(dialogo);
        return this;
    };
};

ui.registrarComponente("dialogo",componenteDialogo,configComponente.clonar({
    descripcion:"Diálogo",
    etiqueta:"Diálogo",
    grupo:"Estructura",
    icono:"dialogo.png"
}));