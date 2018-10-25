export default `<!doctype html>
<style>
* { box-sizing: border-box; }
</style>

<pre id="log"></pre>

<script type="module">
  function log(s) {
    document.all.log.textContent += s + "\\n";
  }
</script>
`;
