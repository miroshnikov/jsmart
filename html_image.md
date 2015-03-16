# {html\_image} #

{html\_image} generates an HTML <img> tag. The height and width are not printed if not supplied.<br>
<br>
<table><thead><th> <b>Attribute Name</b> </th><th> <b>Required</b> </th><th> <b>Default</b> </th><th> <b>Description</b> </th></thead><tbody>
<tr><td>file</td><td>Yes</td><td>n/a</td><td>image <b>URL</b></td></tr>
<tr><td>height</td><td>No</td><td>n/a</td><td>Height to display image</td></tr>
<tr><td>width</td><td>No</td><td>n/a</td><td>Width to display image</td></tr>
<tr><td>alt</td><td>No</td><td>""</td><td>Alternative description of the image</td></tr>
<tr><td>href</td><td>No</td><td>n/a</td><td>href value to link the image to</td></tr>
<tr><td>path_prefix</td><td>No</td><td>n/a</td><td>Prefix for output path</td></tr></tbody></table>

<ul><li>href is the href value to link the image to. If link is supplied, an <code>&lt;a href="LINKVALUE"&gt;&lt;/a&gt;</code> tag is placed around the image tag.</li></ul>

<ul><li>path_prefix is an optional prefix string you can give the output path. This is useful if you want to supply a different server name for the image.</li></ul>

<ul><li>All parameters that are not in the list above are printed as name/value-pairs inside the created <img> tag.