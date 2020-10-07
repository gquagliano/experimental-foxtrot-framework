<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Funciones útiles para la construcción del framework

//TODO Muchas de estas funciones son de PRUEBA y se deben reemplazar por implementaciones más adecuadas y mejor escritas. Además, se deben documentar.

defined('_inc') or exit;

chdir(__DIR__);
define('_closure','java -jar '.escapeshellarg(realpath(__DIR__.'/closure-compiler-v20200517.jar')));

function iniciarRegistroExec() {
    //Registro para depuración
    $registro=__DIR__.'/../desarrollo/exec.log';
    if(PHP_OS_FAMILY=='Windows') {
        $path=shell_exec('echo %PATH%');
        $cordova_home=shell_exec('echo %CORDOVA_HOME%');
        $home_var='USERPROFILE';  
        $home=shell_exec('echo %USERPROFILE%');
        $android=shell_exec('echo %ANDROID_SDK_ROOT%');
        $java=shell_exec('echo %JAVA_HOME%');
    } else {
        $path=shell_exec('echo $PATH');
        $cordova_home=shell_exec('echo $CORDOVA_HOME');
        $home_var='HOME';
        $home=shell_exec('echo $HOME');
        $android=shell_exec('echo $ANDROID_SDK_ROOT');
        $java=shell_exec('echo $JAVA_HOME');
    }
    $usuario=shell_exec('whoami');
    file_put_contents($registro,'# '.date('d/m/Y H:i:s').PHP_EOL.
        '# CWD = '.getcwd().PHP_EOL.
        '# Usuario = '.trim($usuario).PHP_EOL.
        '# PATH = '.trim($path).PHP_EOL.
        '# CORDOVA_HOME = '.trim($cordova_home).PHP_EOL.
        '# '.$home_var.' = '.trim($home).PHP_EOL.
        '# ANDROID_SDK_ROOT = '.trim($android).PHP_EOL.
        '# JAVA_HOME = '.trim($java).PHP_EOL.PHP_EOL
    ,FILE_APPEND);   
}

function registroExec($comando,$respuesta) {
    //Registro para depuración
    file_put_contents(__DIR__.'/../desarrollo/exec.log','# '.$comando.PHP_EOL.trim($respuesta).PHP_EOL.PHP_EOL,FILE_APPEND);
}

function copiar($ruta,$filtro,$destino,$rec=true) {
    if(is_array($filtro)) {
        foreach($filtro as $f) copiar($ruta,$f,$destino,$rec);
        return;
    }

    if(!$filtro) $filtro='{,.}*';
    
    if(!file_exists($destino)) mkdir($destino,0755,true);

    $arr=glob($ruta.$filtro,GLOB_BRACE);

    if($rec) $arr=array_merge($arr,glob($ruta.'*',GLOB_ONLYDIR));

    foreach($arr as $archivo) {
        $archivo=basename($archivo);
        if($archivo=='.'||$archivo=='..') continue;
        if(is_dir($ruta.$archivo)) {
            if($rec) copiar($ruta.$archivo.'/',$filtro,$destino.$archivo.'/',true);
        } else {
            copy($ruta.$archivo,$destino.$archivo);
        }
    }
}

function buscarArchivos($ruta,$filtro,$funcion=null) {
    $res=[];

    $arr=glob($ruta.$filtro,GLOB_BRACE);
    $arr=array_merge($arr,glob($ruta.'*',GLOB_ONLYDIR));
    foreach($arr as $archivo) {
        $archivo=basename($archivo);
        if($archivo=='.'||$archivo=='..') continue;
        if(is_dir($ruta.$archivo)) {
            $res=array_merge($res,buscarArchivos($ruta.$archivo.'/',$filtro,$funcion));
        } else {
            $res[]=$ruta.$archivo;
            if($funcion) call_user_func($funcion,$ruta.$archivo);
        }
    }

    return $res;
}

function limpiarNombreReglaCss($regla) {
    //Remover saltos de línea
    $regla=str_replace(["\n","\r"],[' ',''],$regla);
    //Los espacios y saltos de línea alrededor de , > se pueden limpiar
    $regla=preg_replace('/\s*(,|>)\s*/','$1',$regla);
    return trim($regla);
}

function procesarReglasCss($codigo) {    
    $enComentario=false;
    $enRegla=false;
    $enMedia=false;
    $bufer='';
    $regla='';
    $reglas=[];

    $len=strlen($codigo);
    for($i=0;$i<$len;$i++) {
        if(!$enComentario) {            
            if($codigo[$i]=='/'&&$codigo[$i+1]=='*') {
                $enComentario=true;
            } elseif(!$enRegla) {
                if($codigo[$i]=='{') {
                    if(preg_match('/@media/',$bufer)) {
                        $enMedia=true;
                        $bufer='';
                    } else {
                        $enRegla=true;
                        $regla=limpiarNombreReglaCss($bufer);
                        $bufer='';
                    }
                } elseif($codigo[$i]=='}') {
                    $enMedia=false;
                    $bufer='';
                } else {
                    $bufer.=$codigo[$i];
                }
            } else {
                if($codigo[$i]=='}') {
                    if($enRegla) {
                        $enRegla=false;
                        if(!$enMedia) $reglas[$regla]=$bufer; //Ignorar las reglas dentro de media queries
                        $bufer='';
                    }
                } else {
                    $bufer.=$codigo[$i];
                }
            }

        } else {
            if($codigo[$i-1]=='*'&&$codigo[$i]=='/') $enComentario=false;
        }        
    }

    return $reglas;
}

function comprimirCss($archivo) {
    $css=file_get_contents($archivo);  

    //Procesar @copiar (permite duplicar el cuerpo de una regla dentro de otra)
    if(preg_match_all('/@copiar (.+?)$/m',$css,$coincidencias)) {
        $reglas=procesarReglasCss($css);
        foreach($coincidencias[1] as $i=>$regla) {
            $regla=limpiarNombreReglaCss($regla);
            $cuerpo='';
            if(array_key_exists($regla,$reglas)) {
                $cuerpo=$reglas[$regla];
                //Agregar ; al final en caso de que ya no sea la última regla del bloque
                if(substr(trim($cuerpo),-1)!=';') $cuerpo.=';';
            }
            $css=str_replace($coincidencias[0][$i],$cuerpo,$css);
        }
    }

    //Compresión rápida (solo limpieza de contenido innecesario)
    $css=preg_replace('#/\*.*?\*/#sm','',$css);  
    //$css=preg_replace('#url\s*?\(\s*?(\'|")(.+?)\1\)#msi','url($2)',$css);
    $css=str_replace(["\r","\n"],'',$css);
    $css=preg_replace('/[\s]*([,>:;\}\{])[\s]+/m','$1',$css);
    $css=preg_replace('/\)[\s]+;/m',');',$css); //Evita remover el espacio cuando se encuentra en el selector, ejemplo :not(test) .test
    $css=preg_replace('/[\s]+\{/m','{',$css);
    $css=str_replace(';}','}',$css);

    //Subir los @import al comienzo del archivo
    if(preg_match_all('/(@import url\(.+?\);)/i',$css,$coincidencias)) {
        foreach($coincidencias[0] as $coincidencia) {
            $css=str_replace($coincidencia,'',$css);
            $css=$coincidencia.$css;
        }
    }

    file_put_contents($archivo,$css);
}

function compilarJs($archivos,$destino,$omitirClosure=false) {
    //Agregaremos el hash del archivo original en el encabezado del archivo compilado a fin de poder omitirlo si el mismo no ha cambiado
    //En caso de tratarse de múltiples archivos, el hash será sobre la concatenación de todos ellos
    if(!is_array($archivos)) $archivos=[$archivos];
    $codigo='';   
    $arg='';
    foreach($archivos as $item) {
        //Soporte para comodines (ejemplo **.js)
        $rutas=glob($item);
        foreach($rutas as $ruta) {
            $arg.=' "'.$ruta.'"'; 
            $codigo.=file_get_contents($ruta);   
        }
    }
    $hash=md5($codigo);

    if($omitirClosure) {
        file_put_contents($destino,$codigo);
    } else {
        if(file_exists($destino)&&trim(fgets(fopen($destino,'r')))=='//'.$hash) return;

        $comando=_closure.' --js_output_file '.escapeshellarg($destino).' '.$arg; //TODO Anexando 2&>1 no funciona, al menos en Windows
        $o=shell_exec($comando);
        registroExec($comando,$o);

        if(file_exists($destino)) file_put_contents($destino,'//'.$hash.PHP_EOL.file_get_contents($destino));
    }
}

function compilarFoxtrotJs($destino,$omitirClosure,$omitirModulos=false) {
    $archivos=[
        _fuente.'cliente/util.js',
        _fuente.'cliente/dom.js',
        _fuente.'cliente/arrastra.js',
        _fuente.'cliente/editable.js',
        _fuente.'cliente/servidor.js',
        _fuente.'cliente/sesion.js',
        _fuente.'cliente/ajax.js',
        _fuente.'cliente/aplicacion.js',
        _fuente.'cliente/componente.js',
        _fuente.'cliente/controlador.js',
        _fuente.'cliente/modulo.js',
        _fuente.'cliente/enrutador.js',
        _fuente.'cliente/ui.js',
        _fuente.'cliente/ui.animaciones.js',
        _fuente.'cliente/ui.menu.js',
        _fuente.'cliente/ui.dialogos.js',
        _fuente.'cliente/expresion.js',
        _fuente.'cliente/componentes/**.js', //TODO Debemos definir el orden de los componentes, ya que actualmente se representan en el editor en orden de inclusión, sobre lo cual aquí no tenemos control
        _fuente.'cliente/enrutadores/**.js'
    ];
    if(!$omitirModulos) {
        //Integrar todos los módulos
        $archivos=array_merge($archivos,buscarArchivos(_fuente.'cliente/modulos/','*.js'));
    }
    compilarJs($archivos,$destino,$omitirClosure);
}

function eliminarDir($ruta) {
    if(is_dir($ruta)) {
        if(substr($ruta,-1)!=DIRECTORY_SEPARATOR) $ruta.=DIRECTORY_SEPARATOR;
        $archivos=glob($ruta.'*');
        foreach($archivos as $archivo) eliminarDir($archivo);
        rmdir($ruta);
    } elseif(file_exists($ruta)) {
        unlink($ruta);
    }
}
