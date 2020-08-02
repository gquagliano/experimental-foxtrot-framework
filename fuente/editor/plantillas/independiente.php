<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <base href="<?=\foxtrot::obtenerUrl()?>">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">
    <link rel="stylesheet" href="recursos/css/foxtrot.css">
    <link rel="stylesheet" href="aplicaciones/{editor_nombreAplicacion}/recursos/css/aplicacion.css">
    <link rel="stylesheet" href="aplicaciones/{editor_nombreAplicacion}/cliente/vistas/{editor_nombreVista}.css">
    <meta name="generator" content="Foxtrot 7">
    <link rel="icon" href="{editor_urlFavicon}">
    <title>{editor_titulo}</title>
    {editor_metadatos}
    <style id="foxtrot-estilos"></style>
  </head>
  <body>
    {editor_html}
    <script src="cliente/foxtrot.js"></script>
    <script src="aplicaciones/{editor_nombreAplicacion}/cliente/controladores/{editor_nombreVista}.js"></script>
    <script src="aplicaciones/{editor_nombreAplicacion}/cliente/aplicacion.js"></script>
    <script>
    ui.establecerJson('{editor_json}')
        .ejecutar();
    </script>
  </body>
</html>