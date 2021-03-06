/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Texto.
 * @class
 * @extends componente
 */
var componenteTexto=function() {    
    "use strict";

    this.componente="texto";
    this.contenidoEditable=true;   

    /**
     * Propiedades de Botón.
     */
    this.propiedadesConcretas={
        "Texto":{
            formato:{
                etiqueta:"Formato",
                tipo:"opciones",
                opciones:{
                    p:"Párrafo",
                    enLinea:"En línea",
                    h1:"Título 1",
                    h2:"Título 2",
                    h3:"Título 3",
                    h4:"Título 4",
                    h5:"Título 5",
                    h6:"Título 6",
                    etiqueta:"Etiqueta de campo"
                },
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;         
        
        this.elementoEditable=this.elemento;

        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<p class='texto'>Hacé doble click para comenzar a escribir...</p>");
        
        this.prototipo.crear.call(this);
        return this;
    };
    
    /**
     * Actualiza el componente tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //Las propiedades con expresiones se ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(!ui.enModoEdicion()||!expresion.contieneExpresion(valor)) {
	        if(propiedad=="formato") {
	            var seleccionado=this.elemento.es({clase:"foxtrot-seleccionado"});

	            //Cambiar tipo de etiqueta
	            if(!valor) valor="p";
	            if(valor=="etiqueta") valor="label";
	            if(valor=="enLinea") valor="span";
	            
	            //Crear nuevo elemento con el contenido del actual
	            var elem=document.crear("<"+valor+(valor=="p"?" class='texto'":"")+">");
	            elem.innerHTML=this.elemento.innerHTML;

                //Preservar las clases que no sean del sistema
                for(var i=0;i<this.elemento.classList.length;i++)
                    if(!util.buscarElemento(this.clasesCss,this.elemento.classList[i]))
                        elem.agregarClase(this.elemento.classList[i]);

	            //Reemplazar
	            this.elemento.insertarDespues(elem)
	                .remover();

	            //Actualizar referencia
	            this.elemento=elem;

	            this.fueInicializado=false;
	            this.inicializar();

	            if(ui.enModoEdicion()) {
	                //En el editor, debemos notificar que el elemento fue reemplazado, ya que todos los eventos estaban aplicados sobre el elemento viejo (a diferencia
	                //de otros componentes que cuentan con un contenedor)
	                editor.prepararComponenteInsertado(this);

                    //Restaurar selección
                    if(seleccionado) {
                        editor.limpiarSeleccion()
                            .establecerSeleccion(this.elemento);
                    }
	            }

	            return this;
	        }
	    }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Reemplaza el contenido del componente.
     * @param {string} html - Contenido.
     * @returns {Componente}
     */
    this.establecerHtml=function(html) {
        this.elemento.establecerHtml(html);
        return this;
    };

    /**
     * Reemplaza el contenido del componente como texto plano (sin HTML).
     * @param {string} texto - Contenido.
     * @returns {Componente}
     */
    this.establecerTexto=function(texto) {
        this.elemento.establecerTexto(texto);
        return this;
    };
};

ui.registrarComponente("texto",componenteTexto,configComponente.clonar({
    descripcion:"Texto",
    etiqueta:"Texto",
    icono:"texto.png",
    aceptaHijos:false
}));