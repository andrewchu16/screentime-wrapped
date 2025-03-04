// https://www.imranmanzoor.com

const panels = document.querySelectorAll(".panel1");
const secondaryPanels = document.querySelectorAll(".panel2");
const numberOfPanels = 12;
const rotationCoef = 5;
let elHeight = window.innerHeight / numberOfPanels;
let elWidth = window.innerWidth / numberOfPanels;
const textCallout = document.querySelector(".callout");
const textSub = document.querySelector(".subtitle");

var tl = gsap.timeline({ repeat: -1 });

window.addEventListener("resize", (event) => {
  elHeight = window.innerHeight / numberOfPanels;
  elWidth = window.innerWidth / numberOfPanels;
  tl.clear();
  addItemsToTimeline();
  tl.progress(0);
});

addItemsToTimeline();

//GSAP animations are thrown inside here just to make it easier to call them again on resize
function addItemsToTimeline() {
  //text animation
  tl.fromTo(
    textCallout,
    {
      left: "150%"
    },
    {
      left: "50%",
      ease: "expo.out",
      duration: 1,
      delay: 1.2
    },
    0
  );

  tl.to(
    textCallout,
    {
      y: "-60px",
      delay: 3,
      duration: 0.5,
      ease: "sine.out"
    },
    0
  );

  tl.fromTo(
    textSub,
    {
      opacity: 0,
      y: 50
    },
    {
      opacity: 1,
      y: 0,
      ease: "sine.out",
      duration: 0.5,
      delay: 3
    },
    0
  );

  //text exit

  tl.to(
    [textCallout, textSub],
    {
      left: "-150%",
      ease: "sine.in",
      duration: 1,
      delay: 1.2
    },
    4
  );

  panels.forEach((panel, i) => {
    const stopPosition = 100 - i * 1;
    const wi = window.innerWidth - elWidth * (12 - i) + elWidth;
    const he = window.innerHeight - elHeight * (12 - i) + elHeight;
    const wi8 = window.innerWidth - elWidth * (8 - i) + elWidth;
    // initial rotation
    tl.fromTo(
      panel,
      {
        y: elHeight * 5.5,
        x: elWidth * 5.5,
        width: 0,
        height: 0,
        rotation: -360,
        background: `linear-gradient(105deg,rgba(255, 149, 236, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1) ${stopPosition}%)`
      },
      {
        width: wi,
        height: he,
        y: -elHeight / 1.33 + ((12 - i) * elHeight) / 1.33,
        x: 0,
        duration: 1 + 0.1 * (12 - i),
        ease: "sine.inOut",
        rotation: 0,
        background: `linear-gradient(105deg,rgba(255, 149, 236, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  ${stopPosition}%)`
      },
      0
    );

    // linear rotation
    tl.to(
      panel,
      {
        rotation: 12 * rotationCoef - (i + 1) * rotationCoef,
        duration: 3,
        background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  ${stopPosition}%)`,
        ease: "linear"
      },
      ">"
    );

    //reordering
    tl.to(
      panel,
      {
        rotation: 360,
        y: -elHeight / 6 + ((12 - i) * elHeight) / 6,
        x: -elWidth / 1.2 + ((12 - i) * elWidth) / 1.2,
        background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
        ease: "sine.inOut",
        duration: 1
      },
      ">"
    );

    //linear rotation
    tl.to(
      panel,
      {
        rotation: 12 * rotationCoef - (i + 1) * rotationCoef + 360,
        duration: 4,
        background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
        ease: "linear"
      },
      ">"
    );

    if (i == 0) {
      tl.addLabel("splitStart", "-=0.8");
    }

    secondaryPanels.forEach((twoPanel, index) => {
      const wi2 = window.innerWidth - elWidth * index + elWidth;
      const he2 = window.innerHeight - elHeight * index + elHeight;
      tl.fromTo(
        twoPanel,
        {
          y: elHeight * 5.5,
          x: elWidth * 5.5,
          width: 0,
          height: 0,
          rotation: -360,
          background: `linear-gradient(105deg,rgba(255, 149, 236, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1) 100%)`
        },
        {
          rotation: -90,
          y: 0 + (index * elHeight) / 4 - wi2,
          x: -elWidth / 2 + (index * elWidth) / 2,
          width: wi2,
          height: wi2,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "sine.inOut",
          duration: 1
        },
        "splitStart" + "+=" + String(0.05 * index)
      );

      tl.to(
        twoPanel,
        {
          rotation: 12 * rotationCoef - (12 - index) * rotationCoef - 90,
          duration: 5,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "linear"
        },
        ">"
      );
      
       tl.to(
        twoPanel,
        {
          rotation: 300,
          y: 0 + (index * elHeight) /2 - wi2,
          x: (window.innerWidth*1.1 - wi2 * 1.2 ),
          width: wi2,
          height: wi2,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "sine.inOut",
          duration: 1
        },
        ">"
      );
      
            tl.to(
        twoPanel,
        {
          rotation: "+=15",
          duration: 5,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "linear"
        },
        ">"
      );
      
             tl.to(
        twoPanel,
        {
          rotation: "+=360",
          y: "-=" + String(wi2*2),
          x: "+=" + String(wi2*2),
          width: wi2,
          height: wi2,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "sine.inOut",
          duration: 1
        },
        ">"
      );
      
      
    });

    if (i == 0) {
      tl.to(
        panel,
        {
          rotation: 720 + 90,
          y: window.innerHeight - ((12 - i) * elHeight) / 4,
          x: -elWidth / 2 + ((12 - i) * elWidth) / 2,
          width: 0,
          height: 0,
          opacity: 0,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "sine.inOut",
          duration: 1
        },
        "splitStart" + "+=" + String(0.05 * i)
      );
    } else {
      tl.to(
        panel,
        {
          rotation: 720 + 90,
          y: window.innerHeight - ((12 - i) * elHeight) / 4,
          x: -elWidth / 2 + ((12 - i) * elWidth) / 2,
          width: wi,
          height: wi,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "sine.inOut",
          duration: 1
        },
        "splitStart" + "+=" + String(0.05 * i)
      );

      tl.to(
        panel,
        {
          rotation: (12 * rotationCoef - (i + 1) * rotationCoef) / 1.2 + 810,
          duration: 5,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "linear"
        },
        ">"
      );

      tl.to(
        panel,
        {
          y: window.innerHeight - ((12 - i) * elHeight) / 2,
          x: 0 - elWidth * 1.2,
          rotation: (12 * rotationCoef - (i + 1) * rotationCoef) / 1.2 + 1180,
          ease: "sine.inOut",
          duration: 1,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "sine.inOut"
        },
        ">"
      );

      tl.to(
        panel,
        {
          rotation: (12 * rotationCoef - (i + 1) * rotationCoef) / 1.2 + 1200,
          duration: 5,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "linear"
        },
        ">"
      );

      tl.to(
        panel,
        {
          y: "+=" + String(elHeight*4),
          x: "-=" + String(elWidth*4),
          rotation: (12 * rotationCoef - (i + 1) * rotationCoef) / 1.2 + 1500,
          ease: "sine.inOut",
          duration: 1,
          background: `linear-gradient(90deg,rgba(255, 180, 200, 1) 0%,rgba(255, 89, 226, 1) 6%,rgba(255, 0, 211, 1) 19%,rgba(255, 0, 0, 1) 72%,rgba(0, 0, 0, 1)  100%)`,
          ease: "sine.inOut"
        },
        ">"
      );
    }
  });
}