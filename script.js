document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("roulette");
  const ctx = canvas.getContext("2d");
  const spinButton = document.getElementById("spin");
  // const participantInput = document.getElementById("participant-name");
  // const participantWeightInput = document.getElementById("participant-weight");
  // const addParticipantButton = document.getElementById("add-participant");
  const resetButton = document.querySelector("#reset");

  let roulettes = [];
  let participants = [];
  let colors = [];
  let angle = 0;
  let isSpinning = false;
  let animationFrameId;

  const tech_7_member = [
    "공영균",
    "김일진",
    "김인경",
    "김상훈",
    "김종식",
    "김동환",
    "우창욱",
  ];

  const addParticipant = (name, weight) => {
    if (
      name.trim() === "" ||
      weight <= 0 ||
      participants.some((p) => p.name === name)
    ) {
      return;
    }

    const existingParticipant = participants.find((p) => p.name === name);

    if (existingParticipant) {
      // If the participant already exists, use their existing color
      colors.push(existingParticipant.color);
    } else {
      // If it's a new participant, assign a random color
      const randomColor =
        "#" + Math.floor(Math.random() * 16777215).toString(16);
      colors.push(randomColor);
    }

    participants.push({ name, weight, color: colors[colors.length - 1] });

    drawRoulette(name);
  };

  // addParticipantButton.addEventListener("click", () => {
  //   addParticipant(
  //     participantInput.value,
  //     parseFloat(participantWeightInput.value)
  //   );
  //   participantInput.value = "";
  //   participantWeightInput.value = "";
  // });

  removeParticipant = (name) => {
    const index = participants.findIndex((p) => p.name === name);

    if (index !== -1) {
      const removedParticipant = participants.splice(index, 1)[0];
      const removedColor = removedParticipant.color;

      const res = roulettes.find((roulette) => roulette.name === name);
      if (res) {
        const ctxIndex = roulettes.indexOf(res);
        roulettes.splice(ctxIndex, 1);
        res.ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw the roulette without the removed participant
        drawRoulette();
      }

      // Reuse the removed color for future participants
      colors.push(removedColor);
    }
  };

  const drawRoulette = (name) => {
    if (participants.length === 0) return;

    const totalWeight = participants.reduce((acc, p) => acc + p.weight, 0);
    let startAngle = 0;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    participants.forEach((participant, index) => {
      const sliceAngle = (participant.weight / totalWeight) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const textAngle = startAngle + sliceAngle / 2; // 참여자 이름을 그릴 각도

      // 섹션 그리기
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
        startAngle,
        endAngle
      );
      ctx.fillStyle = colors[index];
      ctx.fill();

      // 참여자 이름 그리기
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(textAngle);
      ctx.textAlign = "right";
      ctx.fillStyle = "#000000"; // 텍스트 색상
      ctx.font = "14px Arial"; // 텍스트 폰트
      ctx.fillText(participant.name, canvas.width / 2 - 10, 0); // 텍스트 위치 조정
      ctx.restore();

      startAngle = endAngle;
    });
    roulettes.push({ ctx, name });

    return ctx;
  };

  const updateRoulette = () => {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawRoulette();
    ctx.restore();
  };

  let spinSpeed = 1000; // 회전 속도 변수
  let isStopping = false; // 스핀 멈추기 시작했는지 표시하는 변수

  const spinRoulette = () => {
    if (isStopping && spinSpeed <= 0) {
      spinSpeed = 0;
      isStopping = false;
      isSpinning = false; // 스핀을 다시 시작할 수 있도록 상태 변경
      spinButton.textContent = "Spin";
    }

    angle += spinSpeed; // 현재 속도로 회전

    // 멈추기 시작했을 때만 속도 감소
    if (isStopping) {
      document.querySelector("#spin").disabled = "true";
      // document.querySelector("#spin").style.display = "none";
      spinSpeed *= Math.random() * (0.995 - 0.99) + 0.99; // 스핀 속도 감소
      console.log(spinSpeed);
      resetButton.style.display = "flex";
    }

    updateRoulette();
    animationFrameId = requestAnimationFrame(spinRoulette);
  };

  spinButton.addEventListener("click", () => {
    if (!isSpinning) {
      spinSpeed = 0.5; // 초기 스핀 속도 설정
      isSpinning = true;
      spinButton.textContent = "Stop";
      requestAnimationFrame(spinRoulette);
    } else {
      isStopping = true; // 스핀 멈추기 시작
      isSpinning = false;
      spinButton.textContent = "Spin";
    }
  });
  // 엔터키 이벤트 추가
  // participantInput.addEventListener("keypress", (e) => {
  //   if (e.key === "Enter") {
  //     addParticipant(
  //       participantInput.value,
  //       parseFloat(participantWeightInput.value)
  //     );
  //     participantInput.value = "";
  //     participantWeightInput.value = "";
  //   }
  // });

  // participantWeightInput.addEventListener("keypress", (e) => {
  //   if (e.key === "Enter") {
  //     addParticipant(
  //       participantInput.value,
  //       parseFloat(participantWeightInput.value)
  //     );
  //     participantInput.value = "";
  //     participantWeightInput.value = "";
  //   }
  // });
  drawRoulette();

  document.querySelectorAll(".plus").forEach((element) => {
    element.addEventListener("click", (e) => {
      const label = e.target.closest("label");
      const inputElement = label.previousElementSibling;
      const ratioElement = label.querySelector(".ratio");

      let currentRatio = parseInt(ratioElement.innerText, 10);
      currentRatio = Math.min(currentRatio + 1, 10); // 최소값은 1으로 설정
      ratioElement.innerText = currentRatio.toString();

      removeParticipant(label.htmlFor);
      inputElement.checked = false;
    });
  });

  document.querySelectorAll(".minus").forEach((element) => {
    element.addEventListener("click", (e) => {
      const label = e.target.closest("label");
      const inputElement = label.previousElementSibling;

      const ratioElement = label.querySelector(".ratio");

      let currentRatio = parseInt(ratioElement.innerText, 10);
      currentRatio = Math.max(currentRatio - 1, 1); // 최소값은 1으로 설정
      ratioElement.innerText = currentRatio.toString();

      removeParticipant(label.htmlFor);
      inputElement.checked = false;
    });
  });

  tech_7_member.forEach((member) => {
    const memberDOM = document.querySelector(`#${member}`);

    memberDOM.addEventListener("click", (e) => {
      const memberRatioDOM = document.querySelector(`.${member}.ratio`);

      if (e.target.checked) {
        addParticipant(e.target.id, parseFloat(memberRatioDOM.innerText));
      } else {
        removeParticipant(e.target.id);
      }
    });
  });

  document.querySelector("#reset").addEventListener("click", () => {
    // location.reload();
  });
});
