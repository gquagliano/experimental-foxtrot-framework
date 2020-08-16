/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Columna de tabla.
 */
var componenteColumnaTabla=function() {    
    this.componente="tabla-columna";

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this; 

        this.contenedor=this.elemento;

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        //No podemos usar document.crear() porque falla al tratarde de un tag que debe estar dentro de <table>
        this.elemento=document.createElement("td"); 
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("tabla-columna",componenteColumnaTabla,configComponente.clonar({
    descripcion:"Columna de tabla",
    etiqueta:"Columna",
    grupo:"Tablas de datos",
    icono:"columna.png"
}));