/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Componente concreto Campo de carga de archivo.
 */
var componenteArchivo=function() {    
    this.componente="archivo";

    this.etiqueta=null;
    this.barra=null;
    this.archivos=[];
    this.ajax=null;
    this.subidaEnCurso=false;

    /**
     * Propiedades de Campo.
     */
    this.propiedadesConcretas={
        "Archivo":{
            multiple:{
                etiqueta:"Múltiple",
                tipo:"bool",
                adaptativa:false
            },
            acepta:{
                etiqueta:"Acepta",
                adaptativa:false
            },
            multimedia:{
                etiqueta:"Multimedia",
                tipo:"opciones",
                opciones:{
                    audio:"Audio",
                    video:"Video",
                    videoFrontal:"Video (cámara frontal)",
                    foto:"Foto",
                    fotoFrontal:"Foto (cámara frontal)"
                },
                adaptativa:false
            },
            subirInmediatamente:{
                etiqueta:"Subir inmediatamente",
                tipo:"bool",
                adaptativa:false
            }
        },
        "Eventos":{
            listo:{
                etiqueta:"Archivos listos",
                adaptativa:false,
                evento:true
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.campo=this.elemento.querySelector("input");
        this.etiqueta=this.elemento.querySelector("label");

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='custom-file'>");

        this.campo=document.crear("<input type='file' class='custom-file-input'>");
        this.elemento.anexar(this.campo);

        this.etiqueta=document.crear("<label class='custom-file-label'>");
        this.elemento.anexar(this.etiqueta);

        this.crearComponente();
        return this;
    };

    /**
     * Establece los eventos predeterminados.
     */
    this.establecerEventos=function() {
        var t=this;

        this.campo.removerEventos();
        
        this.campo.evento("change",function(ev) {
            t.abortar()
                .procesarArchivos()
                .procesarEvento("change","modificacion","modificacion",ev,null);

            var subir=this.propiedad("subirInmediatamente");
            if(typeof subir==="undefined"||subir===null||subir===true) { //por defecto, true
                t.subirArchivos();
            }
        });

        return this;
    };

    /**
     * Reestablece el componente al finalizar la carga.
     */
    var finalizarSubida=(function() {
        this.subidaEnCurso=false;
        if(this.barra) this.barra.remover();
        this.barra=null;
    }).bind(this);

    /**
     * Aborta la carga en curso.
     * @returns {componente}
     */
    this.abortar=function() {
        if(this.ajax) this.ajax.abortar();
        finalizarSubida();
        return this;
    };

    /**
     * Envía los archivos seleccionados al servidor.
     * @returns {componente}
     */
    this.subirArchivos=function() {
        if(!this.archivos.length) return this;

        this.subidaEnCurso=true;

        var params={};
        this.archivos.forEach(function(archivo,i) {
            params["archivo-"+i]=archivo.nativo;
        });

        this.barra=document.crear("<span class='progreso'><span class='progreso-barra'></span></span>");
        this.barra.anexarA(this.elemento);
        
        var t=this;
        this.ajax=servidor.invocarMetodo({
            controlador:null, //Dejarlo sin definir resultará en que se utilice el controlador principal
            componente:"archivo",
            metodo:"recibirArchivos",
            parametros:params,
            formulario:true,
            precarga:false,
            tiempo:0,
            progreso:function(p) {
                if(t.barra) t.barra.querySelector(".progreso-barra").estilos("width",Math.round(p*100)+"%");
                if(p==1) finalizarSubida();
            },
            retorno:function(ret) {
                if(ret) {
                    ret.porCada(function(clave,valor) {
                        var indice=parseInt(clave.substring(clave.indexOf("-")+1));
                        if(isNaN(indice)) return;
                        t.archivos[indice].archivo=valor;
                    });
                }
                t.procesarEvento("listo","listo");
            }
        });

        return this;
    };

    /**
     * Genera el valor de archivos.
     * @returns {componente}
     */
    this.procesarArchivos=function() {
        this.archivos=[];
        var nombres=[];

        var t=this,
            archivos=this.campo.files;
        if(archivos) archivos.porCada(function(i,archivo) {
            t.archivos.push({
                nativo:archivo,
                nombre:archivo.name,
                tamano:archivo.size,
                tipo:archivo.type,
                archivo:null,
                datos:null
            });
            nombres.push(archivo.name);
        });

        this.etiqueta.establecerHtml(nombres.join(", "));

        return this;
    };

    /**
     * Devuelve true si la carga de archivos se encuentra en curso.
     * @returns {boolean}
     */
    this.subiendo=function() {
        return this.subidaEnCurso;
    };

    /**
     * Devuelve a la función de retorno un array de objetos {nombre,datos}, donde nombre es el nombre local del archivo y datos es el contenido codificado en Base64.
     * @param {function} funcion
     * @returns {Object[]}
     */
    this.obtenerBase64=function(funcion) {
        this.procesarArchivos();
        if(this.archivos.length) {
            var promesas=[];

            this.archivos.forEach(function(archivo) {
                promesas.push(new Promise(function(resolver,rechazar) {
                    var lector=new FileReader();
                    lector.onload=(function(l,a) {
                        return function() {
                            a.datos=l.result;
                            resolver();
                        };
                    })(lector,archivo);
                    lector.readAsDataURL(archivo.nativo);
                }));
            });

            var t=this;
            Promise.all(promesas).then(function() {
                funcion(t.archivos);
            });
        }
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        if(propiedad=="multiple") {
            if(valor) {
                this.campo.atributo("multiple",true);
            } else {
                this.campo.removerAtributo("multiple");
            }
            return this;
        }

        if(propiedad=="acepta") {
            this.campo.atributo("accept",valor);
            return this;
        } 
        
        if(propiedad=="multimedia") {
            if(!valor) {
                this.campo.removerAtributo("capture");
            } else {
                if(valor=="audio"||valor=="videoFrontal"||valor=="fotoFrontal") {
                    this.campo.atributo("capture","user");
                } else {
                    this.campo.atributo("capture","environment");
                }
                
                if(valor=="audio") {
                    this.campo.atributo("accept","user");
                } else if(valor=="video"||valor=="videoFrontal") {
                    this.campo.atributo("accept","video/*");
                } else if(valor=="foto"||valor=="fotoFrontal") {
                    this.campo.atributo("accept","image/*");
                }
            }
            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Devuelve o establece el valor del componente.
     * @param {null} [valor] - Valor a establecer. Si se omite, devolverá el valor actual. Nótese que el único valor admitido es null para reestablecer el campo.
     * @returns {(*|Componente)}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") return this.archivos;

        if(!valor) {
            this.abortar();
            this.campo.value=null;
            this.procesarArchivos();
        }
        //Cualquier otro valor es ignorado
        return this;
    };
};

ui.registrarComponente("archivo",componenteArchivo,configComponente.clonar({
    descripcion:"Campo de carga de archivo",
    etiqueta:"Archivo",
    grupo:"Formulario",
    icono:"archivo.png"
}));