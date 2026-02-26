(function () {
  var buttons = document.querySelectorAll('.copy-btn');
  var feedback = document.getElementById('copy-feedback');

  function showFeedback(message) {
    if (!feedback) return;
    feedback.textContent = message;
    window.setTimeout(function () {
      feedback.textContent = '';
    }, 2500);
  }

  function fallbackCopy(text) {
    var input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();

    try {
      document.execCommand('copy');
      showFeedback('Link copiado com sucesso.');
    } catch (err) {
      showFeedback('Não foi possível copiar automaticamente. Copie o link em texto abaixo.');
    }

    document.body.removeChild(input);
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var link = button.getAttribute('data-copy');
      if (!link) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(link)
          .then(function () {
            showFeedback('Link copiado com sucesso.');
          })
          .catch(function () {
            fallbackCopy(link);
          });
      } else {
        fallbackCopy(link);
      }
    });
  });
})();
