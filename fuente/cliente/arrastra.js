/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @external Node
 */

 /**
 * Gestor de eventos de arrastrar y soltar (drag and drop), ideado para abastraer el acceso al mismo para abreviar el código y simplificar
 * la resolución de cualquier incompatibilidad entre navegadores, pero implementando las funciones HTML5 nativas.
 */
(function() {
    "use strict";

    var opcionesArrastre={},
        opcionesDestinos={};

    /**
     * @memberof external:Node
     */
    Node.prototype.removerArrastre=function() {
        var id=this.obtenerId();
        if(!opcionesArrastre.hasOwnProperty(id)) return this;
        var opciones=opcionesArrastre[id];

        var arrastrable=this;
        if(typeof opciones.asa==="string") {
            arrastrable=elem.querySelector(opciones.asa);
        } else if(util.esElemento(opciones.asa)) {
            arrastrable=opciones.asa;
        }

        arrastrable.propiedad("draggable",false)
            .removerAtributo("draggable")
            .removerClase("foxtrot-arrastrable-arrastrable")
            .metadato("arrastra",null)
            .removerEvento("dragstart drag dragend");

        delete opcionesArrastre[this.obtenerId()];

        return this;
    };

    /**
     * @memberof external:Node
     */
    Node.prototype.removerDestino=function() {
        var id=this.obtenerId();
        if(!opcionesDestinos.hasOwnProperty(id)) return this;
        delete opcionesDestinos[id];
        this.removerClase("foxtrot-arrastrable-destino")
            .removerEvento("dragenter dragover dragleave drop");
        return this;
    };

    function dragStart(e) {
        var elem=this.metadato("arrastra"),
            opciones=opcionesArrastre[elem.obtenerId()];
            
        //Detener la propagación permitirá arrastrables anidados
        e.stopPropagation();

        elem.agregarClase("foxtrot-arrastrable-arrastrando");
        
        if(opciones.icono) {
            var ic=opciones.icono;
            if(!util.esElemento(ic)) ic=document.crear("<img>").atributo("src",ic).obtener(0);
            e.dataTransfer.setDragImage(ic,-15,-15);
        }
        
        if(opciones.datos) {
            e.dataTransfer.setData("text/plain",opciones.datos);
        }
    }
    
    function dragEnd(e) {
        var opciones=opcionesArrastre[this.obtenerId()];

        this.removerClase("foxtrot-arrastrable-arrastrando");
        
        //Limpiar también todos los destinos
        var a="foxtrot-arrastrable-arrastrando-sobre";
        document.querySelectorAll("."+a).removerClase(a);
        if(typeof ui!=="undefined") {
            var doc=ui.obtenerDocumento();
            if(doc) doc.querySelectorAll("."+a).removerClase(a);
        }
    }

    function dragEnter(e) {
        var opciones=opcionesDestinos[this.obtenerId()];

        //TODO Determinar si se acepta el elemento que se está arrastrando
        
        this.agregarClase("foxtrot-arrastrable-arrastrando-sobre");
    }

    function dragOver(e) {
        var opciones=opcionesDestinos[this.obtenerId()];

        //TODO Determinar si se acepta el elemento que se está arrastrando
    
        //Si no se invoca preventDefault, no recibirá ninguna operación
        e.preventDefault();
        
        e.dataTransfer.dropEffect="move";     
    }

    function dragLeave(e) {
        var opciones=opcionesDestinos[this.obtenerId()];
        this.removerClase("foxtrot-arrastrable-arrastrando-sobre");        
    }

    function drop(e) {
        var opciones=opcionesDestinos[this.obtenerId()];

        //TODO Determinar si se acepta el elemento que se está soltando (y comunicar de alguna manera a los otros listeners de drop)
        
        this.removerClase("foxtrot-arrastrable-arrastrando-sobre");
    }

    /**
     * Hace a los elementos arrastrables. Establecer opciones=false para deshabilitar.
     * @memberof external:Node
     */
    Node.prototype.arrastrable=function(opciones) {
        if(util.esIndefinido(opciones)) opciones={};
        var predeterminados={
            //Mantenemos los nombres de eventos en inglés
            dragstart:null,
            drag:null,
            dragend:null,
            asa:null,
            icono:null,
            mover:false,
            limite:null,
            datos:null,
            pausado:false
        };
        opciones=Object.assign(predeterminados,opciones);

        if(opciones.mover) {
            //Implementación automática del reposicionamiento del elemento (como una ventana o un diálogo)            
            if(opciones.dragstart) {
                opciones.dragstart=[opciones.dragstart,moverDragstart];
            } else {
                opciones.dragstart=moverDragstart;
            }
            if(opciones.drag) {
                opciones.drag=[opciones.drag,moverDrag];
            } else {
                opciones.drag=moverDrag;
            }
            if(opciones.dragend) {
                opciones.dragend=[opciones.dragend,moverDragend];
            } else {
                opciones.dragend=moverDragend;
            }
            if(!opciones.limite) opciones.limite=window;
        }

        var elem=this;

        this.removerArrastre();
        
        opcionesArrastre[elem.obtenerId()]=opciones;

        var arrastrable=elem;
        if(typeof opciones.asa==="string") {
            arrastrable=elem.querySelector(opciones.asa);
        } else if(util.esElemento(opciones.asa)) {
            arrastrable=opciones.asa;
        }

        arrastrable.propiedad("draggable",true)
            .agregarClase("foxtrot-arrastrable-arrastrable");

        arrastrable.metadato("arrastra",elem);

        if(opciones.dragstart) arrastrable.evento("dragstart",opciones.dragstart);
        if(opciones.drag) arrastrable.evento("drag",opciones.drag);
        if(opciones.dragend) arrastrable.evento("dragend",opciones.dragend);

        arrastrable.evento("dragstart",dragStart)
            .evento("dragend",dragEnd);

        return this;
    };

    /**
     * Hace que los elementos admitan que se suelte otro elemento dentro de sí. Establecer opciones=false para deshabilitar. 
     * @memberof external:Node
     */
    Node.prototype.crearDestino=function(opciones) {
        if(util.esIndefinido(opciones)) opciones={};
        var predeterminados={
            //Mantenemos los nombres de eventos en inglés
            dragenter:null,
            dragover:null,
            dragleave:null,
            drop:null,
            pausado:false
        };
        opciones=Object.assign(predeterminados,opciones);

        var elem=this;

        this.removerDestino();
        
        opcionesDestinos[elem.obtenerId()]=opciones;
        
        elem.agregarClase("foxtrot-arrastrable-destino");

        if(opciones.dragenter) elem.evento("dragenter",opciones.dragenter);
        if(opciones.dragover) elem.evento("dragover",opciones.dragover);
        if(opciones.dragleave) elem.evento("dragleave",opciones.dragleave);
        if(opciones.drop) elem.evento("drop",opciones.drop);

        elem.evento("dragenter",dragEnter)
            .evento("dragover",dragOver)
            .evento("dragleave",dragLeave)
            .evento("drop",drop);

        return this;
    };

    /**
     * Hace que los elementos acepten arrastrar y soltar archivos desde el escritorio del cliente sobre ellos. Establecer opciones=false para deshabilitar.
     * @memberof external:Node
     */
    Node.prototype.crearDestinoArchivo=function(opciones) {


        return this;
    };

    /**
     * Detiene momentáneamente o reestablece las operaciones de arrastre para el elemento.
     * @param {boolean} [pausar=true] - Pausar (`true`) o restaurar (`false`).
     * @memberof external:Node
     * @returns {Node}
     */
    Node.prototype.pausarArrastre=function(pausar) {
        if(util.esIndefinido(pausar)) pausar=true;

        //Verificar que sea un arrastrable, de esta forma el cliente puede llamar pausarArrastre() en cualquier elemento sin verificarlo por su cuenta

        var id=this.obtenerId();

        if(opcionesArrastre.hasOwnProperty(id)&&opcionesArrastre[id].pausado!=pausar) {
            var opciones=opcionesArrastre[id],
                arrastrable=this.metadato("arrastra");

            opciones.pausado=pausar;

            if(pausar) {
                //Almacenar los listeners que vamos a remover para poder reestablecerlos luego
                opciones._eventosPausados_dragstart=arrastrable.evento("dragstart");

                arrastrable.propiedad("draggable",false)
                    .removerAtributo("draggable")
                    .removerClase("foxtrot-arrastrable-arrastrable")
                    .removerEvento("dragstart");
            } else {
                arrastrable.propiedad("draggable",true)
                    .agregarClase("foxtrot-arrastrable-arrastrable")
                    .evento("dragstart",opciones._eventosPausados_dragstart);
            }
        }

        if(opcionesDestinos.hasOwnProperty(id)&&opcionesDestinos[id].pausado!=pausar) {
            var opciones=opcionesDestinos[id];

            opciones.pausado=pausar;

            if(pausar) {
                //Almacenar los listeners que vamos a remover para poder reestablecerlos luego
                opciones._eventosPausados_dragenter=this.evento("dragenter");
                opciones._eventosPausados_dragover=this.evento("dragover");
                opciones._eventosPausados_drop=this.evento("drop");
                
                this.removerClase("foxtrot-arrastrable-destino")
                    .removerEvento("dragenter")
                    .removerEvento("dragover")
                    .removerEvento("drop");
            } else {
                this.agregarClase("foxtrot-arrastrable-destino")
                    .evento("dragenter",opciones._eventosPausados_dragenter)
                    .evento("dragover",opciones._eventosPausados_dragover)
                    .evento("drop",opciones._eventosPausados_drop);
            }
        }

        return this;
    };

    /**
     * Aplica `pausarArrastre(estado)` en el elemento y toda su ascendencia.
     * @param {boolean} estado - Activar o adesactivar.
     * @memberof external:Node
     * @returns {Node}
     */
    Node.prototype.pausarArrastreArbol=function(estado) {
        var elem=this;
        while(elem!==null&&elem.nodeName!="BODY"&&elem.nodeName!="HTML") { //Parar al llegar a <body>
            elem.pausarArrastre(estado);
            elem=elem.padre();
        }
        return this;
    };

    /**
     * Aplica `pausarArrastre(estado)` en el elemento y toda su descendencia.
     * @param {boolean} estado - Activar o adesactivar.
     * @memberof external:Node
     * @returns {Node}
     */
    Node.prototype.pausarArrastreArbolDesc=function(estado) {
        this.pausarArrastre(estado);
        if(this.hasChildNodes)
            this.childNodes.forEach(function(hijo) {
                hijo.pausarArrastreArbolDesc(estado);
            });
        return this;
    };

    //Implementación automática de arrastre
    
    var moverX,moverY,moverLeft,moverTop;

    function moverDragover(e) {
        e=(e||event);
        e.preventDefault();
        //e.stopPropagation();
        e.dataTransfer.dropEffect="move";
    }

    function moverDragstart(e) {
        e=e||event;

        var elem=this.metadato("arrastra"),
            pos=elem.posicionEstilos();

        moverX=e.screenX;
        moverY=e.screenY;
        moverLeft=pos.left;
        moverTop=pos.top;

        if(typeof ui!=="undefined") {
            var cuerpo=ui.obtenerCuerpo();
            if(cuerpo) cuerpo.pausarArrastreArbolDesc(true);
        }

        //Remover el elemento "fantasma"
        e.dataTransfer.setDragImage(new Image,0,0);
        //Implementar dragover en el documento para controlar el cursor
        document.evento("dragover",moverDragover);

        var elem=this.metadato("arrastra");
        elem.agregarClase("foxtrot-arrastrable-arrastrando");
    }

    function moverDrag(e) {
        e=e||event;
        
        var elem=this.metadato("arrastra"),
            dx=moverX-e.screenX,
            dy=moverY-e.screenY;

        if(e.screenX==0||e.screenY==0||dx==0&&dy==0) return;

        moverX=e.screenX;
        moverY=e.screenY;

        //var ancho=elem.ancho(),
        //    alto=elem.alto(),
        //    anchoVentana=window.ancho(),
        //    altoVentana=window.alto();

        //if(moverLeft+dx<=0||moverTop+dy<=0||moverLeft+dx+ancho>=anchoVentana||moverTop+dy+alto>=altoVentana) return; //Fuera de los límites

        moverLeft-=dx;
        moverTop-=dy;
        
        elem.estilos({
            left:moverLeft,
            top:moverTop,
            //Cambiamos el posicionamiento de right a left y bottom a top 
            //TODO Poder configurar este comportamiento
            right:"auto",
            bottom:"auto"
        });
    }

    function moverDragend(e) {
        if(typeof ui!=="undefined") {
            var cuerpo=ui.obtenerCuerpo();
            if(cuerpo) cuerpo.pausarArrastreArbolDesc(false);
        }
        document.removerEvento("dragover",moverDragover);

        var elem=this.metadato("arrastra");
        elem.removerClase("foxtrot-arrastrable-arrastrando");
    }
})();

