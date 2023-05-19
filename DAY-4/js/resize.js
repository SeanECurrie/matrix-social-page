window.addEventListener('resize', () => {
  const boxContainer = document.getElementById('box');
  const boxes = boxContainer.getElementsByClassName('box');

  let totalHeight = 0;
  for (let i = 0; i < boxes.length; i++) {
    totalHeight += boxes[i].offsetHeight;
  }

  boxContainer.style.height = `${totalHeight}px`;
});
