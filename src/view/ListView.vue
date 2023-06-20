<template>
  <div v-if="$var.view.refresh" :style="{
    cursor: ($var.view.cursorShow)? '': 'none'
  }" @mousemove="$var.view.cursorShow = true">
    <template v-if="list.length > 0">
      <n-scrollbar style="max-height: 99vh" ref="scrollBar">
        <div ref="listViewAspect">
          <div style="width: 100%; height: 2px; background-color: transparent"/>
          <template v-if="configManager.get('fullItemCodeShow')">
            <super-list-item
                v-for="(snippet,index) in list"
                :index="index"   :snippet="snippet" :key="index"
                :selected="handleSelect(index,snippet.name)"
                @view-code="handleViewCode"
                @item-refresh="handleRefresh()"
                @edit-item="handleEdit"
                @user-click="ind => $var.utools.selectedIndex = ind"/>
          </template>
          <template v-else>
            <list-item
                v-for="(snippet,index) in list"
                :index="index"   :snippet="snippet" :key="index"
                :selected="handleSelect(index,snippet.name)"
                @view-code="handleViewCode"
                @item-refresh="handleRefresh()"
                @edit-item="handleEdit"
                @user-click="ind => $var.utools.selectedIndex = ind"/>
          </template>
          <div id="info" v-if="$var.view.fullScreenShow">
            <p style="color:gray;">~共有{{list.length}}条数据~</p>
          </div>
        </div>
      </n-scrollbar>
    </template>
    <template v-else-if="$var.view.fullScreenShow">
      <n-result description="可能出现的原因如下" title="空记录" size="small" >
        <template #icon>
          <svg height="256" version="1.1" viewBox="0 0 1024 1024" width="256" xmlns="http://www.w3.org/2000/svg"><defs node-id="41"><linearGradient gradientUnits="objectBoundingBox" id="linearGradient-1" node-id="3" spreadMethod="pad" x1="0.49968413" x2="0.49968413" y1="-0.023164557" y2="1.0070374"><stop offset="0" stop-color="#fdfeff"></stop><stop offset="1" stop-color="#f3f5f8"></stop></linearGradient><linearGradient gradientUnits="objectBoundingBox" id="linearGradient-2" node-id="6" spreadMethod="pad" x1="1.0851918" x2="-0.038083714" y1="0.89788246" y2="0.06672812"><stop offset="0" stop-color="#e7ecf1"></stop><stop offset="1" stop-color="#e5eaf1"></stop></linearGradient><linearGradient gradientUnits="objectBoundingBox" id="linearGradient-3" node-id="9" spreadMethod="pad" x1="0.78579193" x2="0.1899847" y1="0.8108553" y2="0.16976193"><stop offset="0" stop-color="#aeb7c4"></stop><stop offset="1" stop-color="#cfd5e0"></stop></linearGradient><linearGradient gradientUnits="objectBoundingBox" id="linearGradient-4" node-id="12" spreadMethod="pad" x1="1.0422176" x2="-0.08817519" y1="0.8009025" y2="0.18033533"><stop offset="0" stop-color="#aeb7c4"></stop><stop offset="1" stop-color="#cfd5e0"></stop></linearGradient></defs><path d="M 0.00 0.00 L 1024.00 0.00 L 1024.00 1024.00 L 0.00 1024.00 Z" fill="none" id="bg" node-id="16" stroke="none" target-height="1024" target-width="1024" target-x="0" target-y="0"></path><g node-id="66"><path d="M 64.00 64.00 L 960.00 64.00 L 960.00 960.00 L 64.00 960.00 Z" fill="none" group-id="1" id="矩形" node-id="18" stroke="none" target-height="896" target-width="896" target-x="64" target-y="64"></path><g node-id="67"><g node-id="68"><path d="M 546.09 286.53 L 713.17 666.67 L 714.32 670.01 L 714.96 673.31 L 715.13 676.61 L 714.86 679.90 L 714.16 683.07 L 713.05 686.16 L 711.54 689.08 L 709.67 691.80 L 707.42 694.33 L 704.87 696.55 L 701.99 698.48 L 698.77 700.10 L 318.34 861.58 L 314.92 862.76 L 311.53 863.47 L 308.14 863.71 L 304.73 863.53 L 301.46 862.94 L 298.29 861.95 L 295.28 860.57 L 292.51 858.86 L 289.96 856.79 L 287.71 854.40 L 285.83 851.72 L 284.28 848.72 L 75.70 357.33 L 74.55 353.99 L 73.91 350.69 L 73.74 347.39 L 74.01 344.10 L 74.71 340.93 L 75.82 337.84 L 77.33 334.92 L 79.20 332.20 L 81.45 329.67 L 84.00 327.45 L 86.87 325.52 L 90.10 323.90 L 365.73 206.90 L 546.09 286.53 Z" fill="url(#linearGradient-1)" fill-rule="nonzero" group-id="1,2,3" id="Path" node-id="21" stroke="none" target-height="656.81006" target-width="641.39" target-x="73.74" target-y="206.9"></path><path d="M 438.96 727.16 L 428.93 731.42 L 427.80 731.55 L 426.43 731.04 L 425.11 730.05 L 423.68 728.46 L 422.42 726.58 L 421.27 724.27 L 420.41 721.84 L 419.92 719.62 L 419.78 717.49 L 419.98 715.85 L 420.57 714.51 L 421.45 713.79 L 431.47 709.53 L 432.61 709.40 L 433.97 709.91 L 435.30 710.90 L 436.73 712.49 L 437.99 714.37 L 439.14 716.68 L 440.16 719.58 L 440.66 721.87 L 440.76 723.68 L 440.46 725.41 L 439.84 726.51 L 438.96 727.16 Z" fill="#ced7e2" fill-rule="nonzero" group-id="1,2,3" id="Path" node-id="22" stroke="none" target-height="22.149963" target-width="20.980011" target-x="419.78" target-y="709.4"></path><path d="M 401.85 742.91 L 323.08 776.35 L 321.55 776.63 L 319.88 776.27 L 318.27 775.37 L 316.64 773.90 L 315.24 772.06 L 314.04 769.78 L 313.23 767.34 L 312.88 765.05 L 312.96 762.86 L 313.43 761.08 L 314.33 759.62 L 315.59 758.72 L 394.36 725.29 L 395.89 725.00 L 397.56 725.37 L 399.17 726.26 L 400.80 727.74 L 402.20 729.57 L 403.40 731.85 L 404.36 734.75 L 404.72 737.10 L 404.62 739.02 L 404.04 740.81 L 403.13 742.07 L 401.85 742.91 Z" fill="#dae0eb" fill-rule="nonzero" group-id="1,2,3" id="Path" node-id="23" stroke="none" target-height="51.630005" target-width="91.84" target-x="312.88" target-y="725"></path><path d="M 341.92 310.63 L 160.97 387.44 L 159.52 387.88 L 158.06 388.02 L 156.55 387.86 L 154.39 387.15 L 152.37 385.88 L 150.69 384.14 L 149.42 381.94 L 148.72 379.50 L 148.64 377.09 L 149.12 374.75 L 150.12 372.70 L 151.05 371.51 L 152.17 370.55 L 153.49 369.81 L 334.43 293.01 L 335.88 292.57 L 337.35 292.43 L 338.85 292.58 L 341.02 293.30 L 343.04 294.57 L 344.72 296.31 L 345.99 298.50 L 346.68 300.94 L 346.77 303.36 L 346.28 305.69 L 345.29 307.75 L 344.36 308.94 L 343.24 309.90 L 341.92 310.63 Z" fill="#dae0eb" fill-rule="nonzero" group-id="1,2,3" id="Path" node-id="24" stroke="none" target-height="95.59" target-width="198.12999" target-x="148.64" target-y="292.43"></path><path d="M 389.88 406.36 L 208.93 483.16 L 207.49 483.60 L 206.02 483.74 L 204.52 483.59 L 202.35 482.87 L 200.33 481.60 L 198.65 479.86 L 197.38 477.67 L 196.69 475.22 L 196.60 472.81 L 197.09 470.47 L 198.08 468.42 L 199.01 467.23 L 200.13 466.27 L 201.45 465.53 L 382.40 388.73 L 383.85 388.29 L 385.31 388.15 L 386.82 388.30 L 388.98 389.02 L 391.00 390.29 L 392.68 392.03 L 393.95 394.22 L 394.65 396.67 L 394.73 399.08 L 394.25 401.42 L 393.25 403.47 L 392.32 404.66 L 391.20 405.62 L 389.88 406.36 Z" fill="#dae0eb" fill-rule="nonzero" group-id="1,2,3" id="Path备份" node-id="25" stroke="none" target-height="95.59" target-width="198.13" target-x="196.6" target-y="388.15"></path><path d="M 253.61 400.13 L 180.10 431.33 L 178.58 431.80 L 177.04 431.97 L 175.47 431.85 L 173.21 431.17 L 171.14 429.92 L 169.41 428.20 L 168.12 426.02 L 167.45 423.57 L 167.41 421.13 L 167.96 418.78 L 169.03 416.68 L 170.03 415.46 L 171.22 414.48 L 172.62 413.71 L 245.50 382.77 L 247.02 382.30 L 248.56 382.13 L 250.13 382.26 L 252.39 382.94 L 254.46 384.18 L 256.19 385.90 L 257.48 388.09 L 258.16 390.53 L 258.21 392.96 L 257.72 395.31 L 256.75 397.35 L 255.34 399.02 L 253.61 400.13 Z" fill="#dae0eb" fill-rule="nonzero" group-id="1,2,3" id="Path" node-id="26" stroke="none" target-height="49.839996" target-width="90.79999" target-x="167.41" target-y="382.13"></path><path d="M 339.95 572.43 L 266.44 603.63 L 264.91 604.10 L 263.37 604.27 L 261.81 604.15 L 259.55 603.46 L 257.47 602.22 L 255.74 600.50 L 254.46 598.32 L 253.78 595.87 L 253.74 593.43 L 254.29 591.08 L 255.37 588.98 L 256.37 587.76 L 257.55 586.78 L 258.95 586.00 L 331.83 555.07 L 333.36 554.60 L 334.89 554.43 L 336.46 554.56 L 338.72 555.24 L 340.79 556.48 L 342.52 558.20 L 343.81 560.39 L 344.49 562.83 L 344.55 565.26 L 344.05 567.60 L 343.08 569.65 L 341.68 571.32 L 339.95 572.43 Z" fill="#dae0eb" fill-rule="nonzero" group-id="1,2,3" id="Path备份-2" node-id="27" stroke="none" target-height="49.840027" target-width="90.80998" target-x="253.74" target-y="554.43"></path><path d="M 359.08 620.31 L 285.57 651.52 L 284.05 651.99 L 282.51 652.16 L 280.94 652.03 L 278.68 651.35 L 276.61 650.11 L 274.88 648.38 L 273.59 646.20 L 272.92 643.75 L 272.88 641.32 L 273.43 638.96 L 274.51 636.86 L 275.50 635.65 L 276.69 634.66 L 278.09 633.89 L 350.97 602.95 L 352.49 602.49 L 354.03 602.32 L 355.60 602.44 L 357.86 603.12 L 359.93 604.37 L 361.66 606.09 L 362.95 608.27 L 363.63 610.72 L 363.69 613.14 L 363.19 615.49 L 362.22 617.53 L 360.81 619.21 L 359.08 620.31 Z" fill="#dae0eb" fill-rule="nonzero" group-id="1,2,3" id="Path备份-3" node-id="28" stroke="none" target-height="49.839966" target-width="90.81" target-x="272.88" target-y="602.32"></path><path d="M 360.74 209.02 L 405.53 314.56 L 407.38 318.12 L 409.63 321.25 L 412.29 323.99 L 415.32 326.35 L 418.60 328.28 L 422.17 329.80 L 425.91 330.87 L 429.76 331.47 L 433.74 331.62 L 437.70 331.27 L 441.63 330.43 L 445.54 329.07 L 541.95 288.14" fill="url(#linearGradient-2)" fill-rule="nonzero" group-id="1,2,3" id="Path" node-id="29" stroke="none" target-height="122.59999" target-width="181.21002" target-x="360.74" target-y="209.02"></path></g><g node-id="69"><path d="M 921.45 437.89 L 833.18 843.63 L 832.14 847.01 L 830.72 850.06 L 828.93 852.82 L 826.77 855.32 L 824.34 857.48 L 821.62 859.32 L 818.69 860.80 L 815.58 861.90 L 812.27 862.62 L 808.90 862.93 L 805.44 862.79 L 801.88 862.21 L 399.18 769.24 L 395.73 768.19 L 392.57 766.77 L 389.68 764.97 L 387.04 762.82 L 384.73 760.42 L 382.75 757.76 L 381.12 754.87 L 379.89 751.85 L 379.05 748.68 L 378.63 745.43 L 378.68 742.16 L 379.19 738.82 L 499.28 218.67 L 500.31 215.30 L 501.73 212.25 L 503.53 209.48 L 505.69 206.98 L 508.12 204.82 L 510.84 202.98 L 513.77 201.50 L 516.88 200.40 L 520.19 199.68 L 523.56 199.38 L 527.02 199.51 L 530.58 200.09 L 822.34 267.45 L 921.45 437.89 Z" fill="url(#linearGradient-1)" fill-rule="nonzero" group-id="1,2,4" id="Path" node-id="31" stroke="none" target-height="663.55" target-width="542.82" target-x="378.63" target-y="199.38"></path><path d="M 575.78 731.39 L 565.17 728.94 L 564.17 728.38 L 563.36 727.17 L 562.88 725.58 L 562.65 723.46 L 562.74 721.20 L 563.17 718.65 L 563.90 716.18 L 564.81 714.10 L 565.94 712.29 L 567.07 711.08 L 568.33 710.35 L 569.47 710.28 L 580.09 712.73 L 581.08 713.29 L 581.89 714.50 L 582.37 716.09 L 582.60 718.21 L 582.51 720.47 L 582.08 723.02 L 581.21 725.97 L 580.27 728.12 L 579.28 729.63 L 578.02 730.85 L 576.88 731.38 L 575.78 731.39 Z" fill="#ced7e2" fill-rule="nonzero" group-id="1,2,4" id="Path" node-id="32" stroke="none" target-height="21.109985" target-width="19.949951" target-x="562.65" target-y="710.28"></path><path d="M 536.50 722.32 L 453.12 703.07 L 451.72 702.40 L 450.58 701.13 L 449.80 699.45 L 449.35 697.30 L 449.30 695.00 L 449.67 692.45 L 450.45 690.00 L 451.51 687.94 L 452.86 686.21 L 454.29 685.04 L 455.88 684.40 L 457.42 684.41 L 540.80 703.66 L 542.20 704.33 L 543.34 705.60 L 544.12 707.28 L 544.57 709.43 L 544.62 711.74 L 544.25 714.28 L 543.33 717.19 L 542.24 719.31 L 541.03 720.80 L 539.51 721.91 L 538.03 722.39 L 536.50 722.32 Z" fill="#c6d0e0" fill-rule="nonzero" group-id="1,2,4" id="Path" node-id="33" stroke="none" target-height="37.98999" target-width="95.32001" target-x="449.3" target-y="684.4"></path><path d="M 742.10 337.37 L 550.57 293.16 L 549.14 292.66 L 547.87 291.91 L 546.74 290.90 L 545.41 289.05 L 544.53 286.83 L 544.19 284.44 L 544.45 281.92 L 545.32 279.53 L 546.68 277.53 L 548.44 275.93 L 550.45 274.85 L 551.91 274.43 L 553.37 274.32 L 554.87 274.49 L 746.41 318.71 L 747.84 319.21 L 749.10 319.96 L 750.23 320.97 L 751.57 322.82 L 752.45 325.04 L 752.79 327.43 L 752.53 329.95 L 751.65 332.34 L 750.30 334.34 L 748.54 335.94 L 746.53 337.02 L 745.07 337.44 L 743.60 337.55 L 742.10 337.37 Z" fill="#dae0eb" fill-rule="nonzero" group-id="1,2,4" id="Path" node-id="34" stroke="none" target-height="63.22998" target-width="208.59998" target-x="544.19" target-y="274.32"></path><path d="M 618.06 357.87 L 540.24 339.91 L 538.73 339.39 L 537.39 338.63 L 536.20 337.60 L 534.77 335.72 L 533.82 333.50 L 533.44 331.09 L 533.68 328.57 L 534.57 326.19 L 535.97 324.20 L 537.80 322.61 L 539.90 321.55 L 541.43 321.15 L 542.97 321.05 L 544.55 321.25 L 621.69 339.06 L 623.20 339.58 L 624.55 340.34 L 625.74 341.37 L 627.17 343.25 L 628.12 345.47 L 628.50 347.88 L 628.26 350.40 L 627.37 352.78 L 625.99 354.78 L 624.21 356.38 L 622.23 357.47 L 620.11 357.99 L 618.06 357.87 Z" fill="#dae0eb" fill-rule="nonzero" group-id="1,2,4" id="Path" node-id="35" stroke="none" target-height="36.940002" target-width="95.06" target-x="533.44" target-y="321.05"></path><path d="M 817.05 266.23 L 791.26 377.94 L 790.66 381.90 L 790.64 385.76 L 791.19 389.55 L 792.25 393.23 L 793.77 396.72 L 795.76 400.05 L 798.16 403.11 L 800.91 405.86 L 804.05 408.32 L 807.46 410.37 L 811.13 412.00 L 815.10 413.19 L 917.15 436.75" fill="url(#linearGradient-2)" fill-rule="nonzero" group-id="1,2,4" id="Path" node-id="36" stroke="none" target-height="170.51999" target-width="126.51001" target-x="790.64" target-y="266.23"></path></g><g node-id="70"><path d="M 576.71 586.00 L 576.24 582.39 L 576.03 578.56 L 576.24 574.93 L 576.94 571.41 L 578.15 567.95 L 579.88 564.53 L 582.00 561.45 L 584.77 558.35 L 588.28 555.22 L 592.63 552.07 L 602.80 545.52 L 605.84 543.27 L 608.13 541.02 L 609.78 538.78 L 611.00 536.30 L 611.71 533.70 L 611.94 530.94 L 611.69 528.17 L 610.94 525.54 L 609.66 522.98 L 607.92 520.72 L 605.63 518.71 L 602.71 516.95 L 599.52 515.71 L 595.64 514.89 L 590.94 514.56 L 587.19 514.81 L 583.95 515.44 L 581.17 516.39 L 578.78 517.65 L 576.53 519.28 L 574.64 521.10 L 573.08 523.13 L 571.81 525.37 L 570.57 528.58 L 569.83 531.91 L 569.59 535.40 L 569.80 538.49 L 570.27 541.35 L 543.84 540.46 L 543.08 536.29 L 542.82 532.12 L 543.02 528.38 L 543.61 524.73 L 544.58 521.15 L 545.95 517.62 L 547.67 514.27 L 549.77 511.08 L 552.25 508.04 L 555.15 505.15 L 558.28 502.60 L 561.80 500.29 L 565.73 498.23 L 570.13 496.42 L 574.57 495.05 L 579.43 494.03 L 584.76 493.38 L 590.60 493.13 L 596.78 493.37 L 602.38 493.98 L 607.45 494.94 L 612.05 496.22 L 616.64 497.92 L 620.72 499.87 L 624.34 502.03 L 627.53 504.41 L 630.52 507.14 L 633.06 510.00 L 635.18 512.99 L 636.91 516.11 L 638.30 519.44 L 639.28 522.81 L 639.87 526.23 L 640.07 529.74 L 639.74 534.54 L 638.85 538.91 L 637.42 542.92 L 635.47 546.71 L 633.06 550.26 L 630.18 553.58 L 626.97 556.61 L 623.38 559.48 L 619.39 562.19 L 610.92 567.55 L 607.78 569.69 L 605.25 571.94 L 603.24 574.32 L 601.72 576.82 L 600.63 579.48 L 599.97 582.33 L 599.74 585.41 L 599.74 586.60 L 576.71 586.60 L 576.71 586.00 Z M 588.57 597.91 L 591.60 598.16 L 594.38 598.83 L 596.93 599.91 L 599.29 601.37 L 601.26 603.11 L 602.89 605.14 L 604.13 607.42 L 604.89 609.85 L 605.17 612.50 L 604.89 615.14 L 604.13 617.57 L 602.89 619.85 L 601.26 621.88 L 599.29 623.62 L 596.93 625.08 L 594.38 626.16 L 591.60 626.83 L 588.57 627.08 L 585.53 626.83 L 582.75 626.16 L 580.19 625.08 L 577.84 623.62 L 575.87 621.88 L 574.23 619.85 L 572.99 617.57 L 572.24 615.14 L 571.96 612.50 L 572.24 609.85 L 572.99 607.42 L 574.23 605.14 L 575.87 603.11 L 577.84 601.37 L 580.19 599.91 L 582.75 598.83 L 585.53 598.16 L 588.57 597.91 Z" fill="url(#linearGradient-3)" fill-rule="nonzero" group-id="1,2,5" id="Shape" node-id="38" stroke="none" target-height="133.95001" target-width="97.25" target-x="542.82" target-y="493.13"></path><path d="M 835.82 837.56 L 832.57 837.35 L 829.36 836.68 L 826.18 835.53 L 823.19 833.95 L 820.31 831.83 L 817.51 829.11 L 708.31 720.52 L 704.38 723.13 L 695.37 729.41 L 686.19 735.14 L 676.84 740.32 L 667.30 744.97 L 657.51 749.12 L 647.62 752.72 L 637.60 755.77 L 627.46 758.29 L 617.19 760.25 L 606.87 761.66 L 596.49 762.50 L 586.02 762.79 L 576.58 762.55 L 567.17 761.85 L 557.81 760.70 L 548.46 759.09 L 539.21 757.04 L 530.08 754.56 L 521.05 751.66 L 512.13 748.32 L 503.37 744.58 L 494.81 740.44 L 486.44 735.91 L 478.25 730.97 L 470.30 725.66 L 462.62 719.98 L 455.20 713.94 L 448.05 707.52 L 440.37 699.86 L 433.23 691.94 L 426.60 683.73 L 420.48 675.23 L 414.84 666.44 L 409.68 657.32 L 405.05 647.99 L 400.94 638.43 L 397.35 628.62 L 394.28 618.56 L 391.77 608.38 L 389.80 598.03 L 388.39 587.49 L 387.53 576.74 L 387.23 565.77 L 387.46 556.42 L 388.10 547.25 L 389.16 538.24 L 390.61 529.38 L 392.47 520.67 L 395.37 509.86 L 398.82 499.36 L 402.84 489.16 L 407.41 479.22 L 412.54 469.55 L 418.14 460.23 L 424.24 451.27 L 430.83 442.64 L 437.88 434.38 L 445.35 426.54 L 453.23 419.12 L 461.54 412.11 L 470.21 405.56 L 479.23 399.50 L 488.59 393.92 L 498.33 388.82 L 508.31 384.27 L 518.58 380.28 L 529.14 376.85 L 540.01 373.97 L 548.77 372.12 L 557.68 370.67 L 566.74 369.62 L 575.97 368.98 L 585.37 368.75 L 596.61 369.06 L 607.60 369.93 L 618.35 371.36 L 628.90 373.35 L 639.24 375.89 L 649.48 378.99 L 659.44 382.61 L 669.12 386.74 L 678.54 391.39 L 687.71 396.55 L 696.58 402.21 L 705.12 408.34 L 713.33 414.94 L 721.23 422.04 L 728.82 429.65 L 735.95 437.61 L 742.69 446.01 L 749.04 454.88 L 755.02 464.23 L 760.62 474.09 L 765.57 484.13 L 769.89 494.24 L 773.61 504.41 L 776.74 514.66 L 779.28 525.01 L 781.26 535.54 L 782.65 546.05 L 783.46 556.56 L 783.69 567.08 L 783.35 577.64 L 782.42 588.15 L 780.92 598.59 L 778.85 608.95 L 776.19 619.26 L 772.94 629.53 L 769.17 639.55 L 764.82 649.43 L 759.88 659.16 L 754.35 668.77 L 748.20 678.26 L 745.58 682.16 L 855.44 791.40 L 858.04 794.30 L 860.01 797.02 L 861.43 799.61 L 862.53 802.35 L 863.25 804.91 L 863.61 807.33 L 863.70 810.93 L 863.35 814.08 L 862.69 817.03 L 861.98 819.36 L 860.04 822.74 L 857.78 825.85 L 855.20 828.70 L 852.33 831.26 L 849.30 833.40 L 846.09 835.16 L 842.70 836.48 L 839.29 837.28 L 835.82 837.56 Z M 585.37 422.72 L 577.35 422.95 L 569.52 423.58 L 561.86 424.61 L 554.36 426.04 L 547.01 427.85 L 537.93 430.68 L 529.18 434.03 L 520.75 437.91 L 512.61 442.32 L 504.76 447.26 L 497.31 452.64 L 490.23 458.46 L 483.52 464.74 L 477.22 471.44 L 471.39 478.49 L 466.01 485.91 L 461.08 493.72 L 456.66 501.81 L 452.78 510.19 L 449.44 518.86 L 446.62 527.86 L 444.81 535.14 L 443.39 542.56 L 442.36 550.13 L 441.73 557.86 L 441.51 565.77 L 441.78 574.83 L 442.51 583.52 L 443.68 591.85 L 445.29 599.87 L 447.31 607.57 L 449.82 615.27 L 452.67 622.64 L 455.88 629.69 L 459.43 636.44 L 463.33 642.91 L 468.73 650.72 L 474.54 658.03 L 480.78 664.88 L 487.44 671.27 L 494.53 677.23 L 501.90 682.69 L 509.57 687.66 L 517.55 692.16 L 525.81 696.16 L 534.21 699.64 L 542.79 702.61 L 551.55 705.06 L 560.45 706.98 L 569.37 708.36 L 578.33 709.19 L 587.33 709.47 L 596.13 709.20 L 604.73 708.42 L 613.16 707.15 L 621.43 705.38 L 629.55 703.11 L 637.53 700.35 L 645.30 697.13 L 652.86 693.44 L 660.22 689.27 L 667.40 684.62 L 674.25 679.58 L 680.84 674.09 L 687.19 668.16 L 693.29 661.75 L 699.15 654.85 L 704.18 648.23 L 708.74 641.46 L 712.84 634.54 L 716.50 627.46 L 719.73 620.22 L 722.55 612.76 L 724.92 605.24 L 726.85 597.63 L 728.34 589.92 L 729.40 582.11 L 730.01 574.25 L 730.18 566.39 L 729.91 558.51 L 729.19 550.61 L 728.03 542.66 L 726.43 534.83 L 724.39 527.06 L 721.89 519.34 L 718.93 511.65 L 715.50 504.00 L 711.54 496.56 L 707.26 489.47 L 702.66 482.72 L 697.74 476.29 L 692.50 470.18 L 686.90 464.33 L 681.05 458.86 L 674.95 453.75 L 668.59 448.99 L 661.96 444.59 L 655.09 440.55 L 648.04 436.91 L 640.79 433.68 L 633.33 430.83 L 625.66 428.38 L 617.89 426.37 L 609.99 424.80 L 601.95 423.66 L 593.75 422.97 L 585.37 422.72 Z" fill="url(#linearGradient-4)" fill-rule="nonzero" group-id="1,2,5" id="Shape" node-id="39" stroke="none" target-height="468.81" target-width="476.47" target-x="387.23" target-y="368.75"></path></g></g></g></svg>
        </template>
        <template #footer>
          1. 目前您未保存过一条代码片段 <br/>
          2. 您的搜索词未匹配上任何一条代码片段
        </template>
      </n-result>
    </template>

    <div id="extra" v-if="$var.view.fullScreenShow" @mouseenter="expanded = true" @mouseleave="expanded = false">
      <template v-if="expanded || $var.view.buttonFixed">
        <n-space vertical style="padding-bottom: 6px">
          <n-tooltip trigger="hover" placement="left">
            <template #trigger>
              <n-button strong secondary circle type="primary" :color="configManager.getGlobalColor()">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z" fill="currentColor"></path></svg>
                </template>
              </n-button>
            </template>
            添加代码片段
          </n-tooltip>

          <n-tooltip trigger="hover" placement="left" >
            <template #trigger>
              <n-button strong secondary circle type="primary" :color="configManager.getGlobalColor()" @click="$var.view.settingActive = true">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 7h9v2h-9zm0 8h9v2h-9zm3-4h6v2h-6zm-3 1L8 7v4H2v2h6v4z" fill="currentColor"></path></svg>
                </template>
              </n-button>
            </template>
            查看更多
          </n-tooltip>
          <n-tooltip trigger="hover" placement="left">
            <template #trigger>
              <n-button strong circle secondary type="primary"  :color="configManager.getGlobalColor()"  @contextmenu="$var.view.buttonFixed = !$var.view.buttonFixed" @click="refreshListView()">
                <template #icon>
                  <template v-if="$var.view.buttonFixed">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M21.25 7.5a.75.75 0 0 1 .743.648L22 8.25v8.5a3.25 3.25 0 0 1-3.066 3.245L18.75 20H6.061l.72.72a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073l-2-2l-.064-.072a1.213 1.213 0 0 1-.007-.01l.07.082a.753.753 0 0 1-.127-.89a.775.775 0 0 1 .128-.17l2-2a.75.75 0 0 1 1.133.976l-.073.084l-.72.72h12.69a1.75 1.75 0 0 0 1.744-1.607l.006-.143v-8.5a.75.75 0 0 1 .75-.75zm-3.054-5.353l.084.073l2 2a.75.75 0 0 1 .071.081l-.07-.081a.752.752 0 0 1 .004 1.056l-.005.004l-2 2a.75.75 0 0 1-1.133-.976l.073-.084l.718-.72H5.25a1.75 1.75 0 0 0-1.744 1.606L3.5 7.25v8.5a.75.75 0 0 1-1.493.102L2 15.75v-8.5a3.25 3.25 0 0 1 3.066-3.245L5.25 4h12.689l-.72-.72a.75.75 0 0 1-.072-.976l.073-.084a.75.75 0 0 1 .976-.073zM12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8z" fill="currentColor"></path></g></svg>
                  </template>
                  <template v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20"><g fill="none"><path d="M14.854 2.146a.5.5 0 0 0-.708.708L15.293 4H4a2 2 0 0 0-2 2v6.5a.5.5 0 0 0 1 0V6a1 1 0 0 1 1-1h11.293l-1.147 1.146a.5.5 0 0 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2zM16 15a1 1 0 0 0 1-1V7.5a.5.5 0 0 1 1 0V14a2 2 0 0 1-2 2H4.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2a.5.5 0 0 1 .708.708L4.707 15H16zm-3-5a3 3 0 1 1-6 0a3 3 0 0 1 6 0zm-1 0a2 2 0 1 0-4 0a2 2 0 0 0 4 0z" fill="currentColor"></path></g></svg>
                  </template>
                </template>
              </n-button>
            </template>
            左击刷新，右击{{$var.view.buttonFixed? '取消固定':'固定'}}
          </n-tooltip>
        </n-space>
      </template>
      <template v-else>
        <n-tooltip trigger="hover" placement="left">
          <template #trigger>
            <n-button strong circle type="primary" quaternary :color="configManager.getGlobalColor()" @click="expanded = true" >
              <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" fill="currentColor"></path></svg>
              </template>
            </n-button>
          </template>
          展开
        </n-tooltip>
      </template>
    </div>
  </div>
</template>

<script setup>
import {NButton, useMessage, useNotification} from "naive-ui";
import ListItem from "../components/ListItem.vue";
import {computed, h, onMounted, onUpdated, ref} from "vue";
import {init, parseSearchWord,} from "../js/keyboard.js";
import {$var, CODE_VIEW, CREATE_VIEW, UPDATE_VIEW} from "../js/store";
import {refreshListView} from "../js/some";
import {configManager} from "../js/core";
import SuperListItem from "../components/SuperListItem.vue";
import $version from '../js/version'
const scrollBar = ref()
const listViewAspect = ref()
window.$message = useMessage();
const list = computed(()=>parseSearchWord($var.utools.search,$var.view.refresh)) // 其中parseSearchWord第二个参数只是单纯为了响应式触发，没有其他作用
const expanded = ref(false)
const fixed = ref(false)
const handleEdit = (name)=>{
  $var.currentName = name;
  $var.currentMode = UPDATE_VIEW;
}
const handleSelect = (index,name)=>{
  if(index === $var.utools.selectedIndex){
    $var.currentName = name;
    return true;
  }else{
    return false;
  }
}

const handleViewCode = (name)=>{
  $var.currentName = name;
  $var.currentMode = CODE_VIEW;
}

const handleRefresh = ()=>{
  $var.utools.keepSelectedStatus = true;
  refreshListView();
}
const newVersionShow = ()=>{
  if(configManager.get('version') !== $version.version){
    utools.setExpendHeight(550)
    const notification = useNotification();
    const n = notification.create({
      title: "🎉新版本内容介绍",
      content: $version.content,
      meta: $version.version,
      action: () =>
          h(
              NButton,
              {
                text: true,
                type: 'primary',
                onClick: () => {
                  configManager.set('version',$version.version)
                  n.destroy()
                  $message.info("该版本通知后续不会再出现")
                }
              },
              {
                default: () => '已读'
              }
          ),
      onClose: () => {
        $message.info('该版本通知下次仍会出现，如果不想再出现请点击【已读】')
        return true
      }
    })
  }else{
    handleAppHeight();
  }
}
onMounted(()=>{
  parseSearchWord($var.utools.search)
  newVersionShow();
  init(list)
  $var.scroll.listInvoker = scrollBar;

})
const handleAppHeight = ()=>{
  if($var.view.fullScreenShow){
    utools.setExpendHeight(545)
  }else{
    if(listViewAspect.value == null){
      utools.setExpendHeight(0)
      $var.view.recoverLiteHeight = 0;
    }else{
      let offset = listViewAspect.value.offsetHeight;
      if(offset == null){
        utools.setExpendHeight(0)
        $var.view.recoverLiteHeight = 0;
      }else if(offset > 535){
        utools.setExpendHeight(545)
        $var.view.recoverLiteHeight = 545;
      }else{
        utools.setExpendHeight(offset+6)
        $var.view.recoverLiteHeight = offset+6;
      }
    }
  }
}

onUpdated(()=>{
  console.log('update listview')
  handleAppHeight()
})



</script>

<style scoped>
#info {
  text-align: center;
  margin-bottom: 100px;
}
#extra{
  position: fixed;
  right:20px;
  bottom: 6px;
  z-index: 20;
  text-align: center;
}
</style>