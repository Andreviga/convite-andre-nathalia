(function () {
  var buttons = document.querySelectorAll('.copy-btn');
  var feedback = document.getElementById('copy-feedback');
  var feedbackTimeoutId = null;

  function showFeedback(message) {
    if (!feedback) return;

    if (feedbackTimeoutId) {
      window.clearTimeout(feedbackTimeoutId);
    }

    feedback.textContent = message;

    feedbackTimeoutId = window.setTimeout(function () {
      feedback.textContent = '';
      feedbackTimeoutId = null;
    }, 2500);
  }

  function fallbackCopy(text, successMessage) {
    var input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();

    try {
      var copied = document.execCommand('copy');
      if (copied) {
        showFeedback(successMessage);
      } else {
        showFeedback('Não foi possível copiar automaticamente. Copie o link em texto abaixo.');
      }
    } catch (err) {
      showFeedback('Não foi possível copiar automaticamente. Copie o link em texto abaixo.');
    }

    document.body.removeChild(input);
  }

  if (!buttons.length) return;

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var link = button.getAttribute('data-copy');
      var successMessage = button.getAttribute('data-success') || 'Link copiado com sucesso.';
      if (!link) return;

      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        navigator.clipboard
          .writeText(link)
          .then(function () {
            showFeedback(successMessage);
          })
          .catch(function () {
            fallbackCopy(link, successMessage);
          });
      } else {
        fallbackCopy(link, successMessage);
      }
    });
  });
})();
