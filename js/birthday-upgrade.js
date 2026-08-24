/* =========================================================
   ❤️ CINEMATIC BIRTHDAY EXPERIENCE
   FINAL AUTO-SCENE + FAIL-SAFE VERSION

   Compatible with existing:
   - config.js
   - cinematic.css
   - garden.js
   - fireworks.js
   - original index.html

   IMPORTANT:
   Replace the COMPLETE birthday-upgrade.js
   with this file.
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CONFIG
    ===================================================== */

    const C =
        (typeof BIRTHDAY_CONFIG !== "undefined")
            ? BIRTHDAY_CONFIG
            : window.BIRTHDAY_CONFIG;


    if (!C) {

        console.error(
            "❌ BIRTHDAY_CONFIG not found."
        );

        return;

    }


    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    let experience = null;

    let music = null;

    let currentScene = null;

    let currentVideo = null;

    let started = false;

    let finished = false;

    let transitionLocked = false;

    let finalCelebrationStarted = false;

    let activeTimer = null;

    let sceneIndex = 0;


    /* =====================================================
       TIMINGS
    ===================================================== */

    const TIMING = {

    hero: 8000,

    story: 10000,

    photos: 6500,        // Har ek photo ka time

    interlude: 6500,

    letter: 13000,

    final: 12000,

    transition: 1200,

    videoLoadTimeout: 8000,

    finalRevealDelay: 12000

};
   


    /* =====================================================
       UTILITY
    ===================================================== */

    function hasPath(value) {

        return (
            typeof value === "string" &&
            value.trim().length > 0
        );

    }


    function escapeHTML(value) {

        if (
            value === undefined ||
            value === null
        ) {

            return "";

        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function safeRun(name, callback) {

        try {

            callback();

        } catch (error) {

            console.error(
                "Birthday module error [" +
                name +
                "]:",
                error
            );

        }

    }


    function clearActiveTimer() {

        if (activeTimer) {

            clearTimeout(
                activeTimer
            );

            activeTimer = null;

        }

    }


    function wait(ms) {

        return new Promise(
            function (resolve) {

                setTimeout(
                    resolve,
                    ms
                );

            }
        );

    }


    /* =====================================================
       CSS COMPATIBILITY LAYER

       Existing cinematic.css uses bx-scene-style
       animation in parts, while current JS creates
       bx-section / bx-screen.

       This bridge makes the existing design work
       without replacing cinematic.css.
    ===================================================== */

    function installSceneEngineCSS() {

        if (
            document.getElementById(
                "birthdayFinalEngineCSS"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "birthdayFinalEngineCSS";


        style.textContent = `

            /* =============================================
               MAIN EXPERIENCE
            ============================================= */

            #birthdayExperience {

                position: fixed !important;

                inset: 0 !important;

                width: 100vw !important;

                height: 100vh !important;

                overflow: hidden !important;

                z-index: 99999 !important;

            }


            /* =============================================
               ORIGINAL PAGE STAYS BEHIND
            ============================================= */

            #birthdayExperience
            .bx-screen,

            #birthdayExperience
            .bx-section {

                position: absolute !important;

                inset: 0 !important;

                width: 100% !important;

                height: 100% !important;

                min-height: 100vh !important;

                min-height: 100dvh !important;

                display: flex !important;

                align-items: center !important;

                justify-content: center !important;

                overflow-y: auto !important;

                overflow-x: hidden !important;

                padding:
                    40px 22px !important;

                opacity: 0 !important;

                visibility: hidden !important;

                pointer-events: none !important;

                transform:
                    scale(1.045)
                    translateY(24px) !important;

                transition:
                    opacity 900ms ease,
                    transform 1200ms
                        cubic-bezier(.22,.61,.36,1),
                    visibility 900ms ease !important;

                z-index: 1 !important;

            }


            /* =============================================
               ACTIVE SCENE
            ============================================= */

            #birthdayExperience
            .bx-screen.active,

            #birthdayExperience
            .bx-section.active {

                opacity: 1 !important;

                visibility: visible !important;

                pointer-events: auto !important;

                transform:
                    scale(1)
                    translateY(0) !important;

                z-index: 10 !important;

            }


            /* =============================================
               EXIT SCENE
            ============================================= */

            #birthdayExperience
            .bx-screen.exit,

            #birthdayExperience
            .bx-section.exit {

                opacity: 0 !important;

                visibility: hidden !important;

                pointer-events: none !important;

                transform:
                    scale(.97)
                    translateY(-22px) !important;

                z-index: 2 !important;

            }


            /* =============================================
               CONTENT
            ============================================= */

            #birthdayExperience
            .bx-center,

            #birthdayExperience
            .bx-container {

                position: relative !important;

                width:
                    min(900px, 94vw) !important;

                margin: auto !important;

                z-index: 5 !important;

            }


            /* =============================================
               VIDEO
            ============================================= */

            #birthdayExperience
            .bx-video {

                width:
                    min(900px, 94vw) !important;

                margin:
                    30px auto 0 !important;

                position: relative !important;

                z-index: 20 !important;

            }


            #birthdayExperience
            .bx-video video {

                display: block !important;

                width: 100% !important;

                max-height:
                    70vh !important;

                max-height:
                    70dvh !important;

                object-fit: contain !important;

                border-radius: 18px !important;

                background: #000 !important;

            }


            /* =============================================
               PHOTOS
            ============================================= */

            #birthdayExperience
            .bx-gallery {

                position: relative !important;

                z-index: 20 !important;

                width: 100% !important;

            }


            #birthdayExperience
            .bx-photo {

                cursor: pointer !important;

                position: relative !important;

                z-index: 25 !important;

            }


            /* =============================================
               LIGHTBOX
            ============================================= */

            #birthdayExperience
            .bx-lightbox {

                z-index: 100000 !important;

            }


            /* =============================================
               MUSIC
            ============================================= */

            #birthdayExperience
            .bx-music {

                z-index: 100050 !important;

            }


            /* =============================================
               PROGRESS
            ============================================= */

            #birthdayExperience
            .bx-progress {

                z-index: 100060 !important;

            }


            /* =============================================
               START BUTTON
            ============================================= */

            #birthdayExperience
            #bxStart {

                position: relative !important;

                z-index: 100 !important;

                cursor: pointer !important;

            }


            /* =============================================
               MOBILE
            ============================================= */

            @media (max-width: 600px) {

                #birthdayExperience
                .bx-screen,

                #birthdayExperience
                .bx-section {

                    padding:
                        30px 16px !important;

                }


                #birthdayExperience
                .bx-video video {

                    max-height:
                        62vh !important;

                    max-height:
                        62dvh !important;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       CREATE EXPERIENCE
    ===================================================== */

    function createExperience() {

        const old =
            document.getElementById(
                "birthdayExperience"
            );


        if (old) {

            old.remove();

        }


        experience =
            document.createElement(
                "div"
            );


        experience.id =
            "birthdayExperience";


        experience.innerHTML = `

            <div class="bx-background">

                <div class="bx-orb one"></div>

                <div class="bx-orb two"></div>

            </div>


            <div class="bx-noise"></div>


            <div
                class="bx-progress"
                id="bxProgress">
            </div>


            <!-- MUSIC -->

            <button
                class="bx-music"
                id="bxMusic"
                aria-label="Music">

                🔇

            </button>


            <!-- =========================================
                 INTRO
            ========================================== -->

            <section
                class="bx-screen"
                data-section="intro">

                <div class="bx-center">

                    <div class="bx-label">

                        A LITTLE SOMETHING FOR YOU

                    </div>


                    <h1
                        class="bx-intro-title">

                        Hey,

                        <span id="bxIntroName">

                            ${escapeHTML(C.name)}

                        </span>

                    </h1>


                    <p
                        class="bx-subtitle">

                        ${escapeHTML(
                            C.introSmallText ||
                            "I could have just wished you normally..."
                        )}

                        <br><br>

                        <span>

                            ${escapeHTML(
                                C.introText ||
                                "But you're not exactly a normal person to me."
                            )}

                        </span>

                    </p>


                    <button
                        class="bx-button"
                        id="bxStart">

                        Open Your Surprise ✦

                    </button>


                    <p
                        style="
                        color:#665b68;
                        font-size:10px;
                        letter-spacing:2px;
                        margin-top:25px;
                        ">

                        🔊 Turn your volume up

                    </p>

                </div>

            </section>


            <!-- =========================================
                 HERO
            ========================================== -->

            <section
                class="bx-section"
                data-section="hero">

                <div class="bx-center">

                    <div class="bx-section-label">

                        TODAY IS DIFFERENT

                    </div>


                    <h1
                        class="bx-heading">

                        Happy
                        <i>Birthday</i>

                    </h1>


                    <div
                        class="bx-hero-name">

                        ${escapeHTML(C.name)}

                        ❤️

                    </div>


                    <p
                        class="bx-subtitle">

                        Some people enter your life normally...

                        <br><br>

                        and somehow become
                        a little more special
                        than they were supposed to.

                    </p>

                </div>

            </section>


            <!-- =========================================
                 STORY
            ========================================== -->

            <section
                class="bx-section"
                data-section="story">

                <div class="bx-container">

                    <div
                        class="bx-section-label">

                        01 — A LITTLE STORY

                    </div>


                    <h2
                        class="bx-heading">

                        ${escapeHTML(
                            C.storyTitle ||
                            "This wasn't supposed to become this."
                        )}

                    </h2>


                    <div
                        class="bx-text"
                        id="bxStory">

                    </div>

                </div>

            </section>


            <!-- =========================================
                 PHOTOS
            ========================================== -->

            <section
                class="bx-section"
                data-section="photos">

                <div class="bx-container">

                    <div
                        class="bx-section-label">

                        02 — LITTLE MOMENTS

                    </div>


                    <h2
                        class="bx-heading">

                        Things worth
                        <i>remembering.</i>

                    </h2>


                    <p
                        class="bx-text">

                        Because some pictures
                        are not just pictures.

                        <br><br>

                        They're tiny pieces
                        of memories.

                    </p>


                    <div
                        class="bx-gallery"
                        id="bxGallery">

                    </div>

                </div>

            </section>


            <!-- =========================================
                 VIDEO 1
            ========================================== -->

            <section
                class="bx-section bx-video-section"
                data-section="video1">

                <div class="bx-container">

                    <div
                        class="bx-section-label">

                        03 — PRESS PLAY

                    </div>


                    <h2
                        class="bx-heading">

                        Some moments
                        deserve <i>motion.</i>

                    </h2>


                    <div class="bx-video">

                        <video
                            id="bxVideo1"
                            controls
                            playsinline
                            preload="metadata">

                            <source
                                src=""
                                type="video/mp4">

                        </video>

                    </div>

                </div>

            </section>


            <!-- =========================================
                 INTERLUDE
            ========================================== -->

            <section
                class="bx-section bx-interlude"
                data-section="interlude">

                <div class="bx-center">

                    <div class="bx-label">

                        WAIT...

                    </div>


                    <h2>

                        You thought

                        <br>

                        <span>

                            that was it?

                        </span>

                    </h2>


                    <p
                        style="
                        color:#766a77;
                        margin-top:35px;
                        letter-spacing:4px;
                        ">

                        Not quite.

                    </p>

                </div>

            </section>


            <!-- =========================================
                 LETTER
            ========================================== -->

            <section
                class="bx-section"
                data-section="letter">

                <div class="bx-container">

                    <div
                        class="bx-section-label">

                        04 — SOMETHING I WANTED TO SAY

                    </div>


                    <div class="bx-letter">

                        <h2>

                            Hey

                            <span>

                                ${escapeHTML(C.name)}

                            </span>,

                        </h2>


                        <div
                            id="bxLetter">

                        </div>


                        <div
                            style="
                            margin-top:60px;
                            color:#7d717d;
                            line-height:1.8;
                            ">

                            — Someone who may like you

                            <br>

                            <span
                                style="
                                color:#ff73c2;
                                ">

                                a little more than he should. ♥

                            </span>

                        </div>

                    </div>

                </div>

            </section>


            <!-- =========================================
                 VIDEO 2
            ========================================== -->

            <section
                class="bx-section bx-video-section"
                data-section="video2">

                <div class="bx-container">

                    <div
                        class="bx-section-label">

                        05 — ONE MORE THING

                    </div>


                    <h2
                        class="bx-heading">

                        Okay...

                        <i>one more.</i>

                    </h2>


                    <div class="bx-video">

                        <video
                            id="bxVideo2"
                            controls
                            playsinline
                            preload="metadata">

                            <source
                                src=""
                                type="video/mp4">

                        </video>

                    </div>

                </div>

            </section>


            <!-- =========================================
                 FINAL VIDEO
            ========================================== -->

            <section
                class="bx-section bx-video-section"
                data-section="finalVideo">

                <div class="bx-container">

                    <div
                        class="bx-section-label">

                        06 — THE LAST SURPRISE

                    </div>


                    <h2
                        class="bx-heading">

                        This one's

                        <i>just for you.</i>

                    </h2>


                    <div class="bx-video">

                        <video
                            id="bxFinalVideo"
                            controls
                            playsinline
                            preload="metadata">

                            <source
                                src=""
                                type="video/mp4">

                        </video>

                    </div>

                </div>

            </section>


            <!-- =========================================
                 FINAL MESSAGE
            ========================================== -->

            <section
                class="bx-section bx-final"
                data-section="final">

                <div class="bx-center">

                    <div class="bx-label">

                        AND FINALLY...

                    </div>


                    <h1>

                        Happy

                        <br>

                        <span>

                            Birthday.

                        </span>

                    </h1>


                    <div
                        class="bx-final-name">

                        ${escapeHTML(C.name)}

                        ❤️

                    </div>


                    <p
                        class="bx-final-message">

                        ${escapeHTML(
                            C.finalMessage ||
                            ""
                        )}

                    </p>


                    <div
                        class="bx-secret">

                        <strong>

                            P.S.

                        </strong>


                        <p>

                            ${escapeHTML(
                                C.finalSecret ||
                                ""
                            )}

                        </p>


                        <div class="bx-heart">

                            ♥

                        </div>


                        <small>

                            ${escapeHTML(
                                C.finalFooter ||
                                ""
                            )}

                        </small>

                    </div>


                    <p
                        style="
                        margin-top:60px;
                        color:#514852;
                        font-size:9px;
                        letter-spacing:2px;
                        line-height:2;
                        ">

                        Made with a little too much effort

                        <br>

                        and probably a little too much affection.

                    </p>

                </div>

            </section>


            <!-- =========================================
                 LIGHTBOX
            ========================================== -->

            <div
                class="bx-lightbox"
                id="bxLightbox">

                <button
                    class="bx-close"
                    id="bxClose">

                    ×

                </button>


                <img
                    id="bxLightboxImage"
                    src=""
                    alt="Memory">

            </div>

        `;


        document.body.appendChild(
            experience
        );


        /*
         * First scene only.
         */

        const intro =
            getScene(
                "intro"
            );


        if (intro) {

            intro.classList.add(
                "active"
            );

            currentScene =
                intro;

            sceneIndex = 0;

        }

    }


    /* =====================================================
       SCENE HELPERS
    ===================================================== */

    function getScenes() {

        if (!experience) {
            return [];
        }


        return Array.from(
            experience.querySelectorAll(
                ".bx-screen, .bx-section"
            )
        ).filter(
            function (el) {

                return (
                    el.style.display !==
                    "none"
                );

            }
        );

    }


    function getScene(name) {

        if (!experience) {
            return null;
        }


        return experience.querySelector(
            '[data-section="' +
            name +
            '"]'
        );

    }


    function setActiveScene(
        next
    ) {

        if (!next) {
            return;
        }


        const scenes =
            getScenes();


        const old =
            currentScene;


        if (old === next) {
            return;
        }


        clearActiveTimer();


        /*
         * Pause currently playing video.
         */

        pauseAllVideos();


        /*
         * OLD SCENE
         */

        if (old) {

            old.classList.remove(
                "active"
            );

            old.classList.add(
                "exit"
            );

        }


        /*
         * Small transition delay.
         */

        setTimeout(
            function () {

                scenes.forEach(
                    function (scene) {

                        if (
                            scene !== next &&
                            scene !== old
                        ) {

                            scene.classList.remove(
                                "active"
                            );

                            scene.classList.remove(
                                "exit"
                            );

                        }

                    }
                );


                next.classList.remove(
                    "exit"
                );


                next.classList.add(
                    "active"
                );


                currentScene =
                    next;


                sceneIndex =
                    scenes.indexOf(
                        next
                    );


                updateProgress(
                    scenes,
                    sceneIndex
                );


                onSceneEntered(
                    next
                );

            },
            old
                ? TIMING.transition
                : 0
        );

    }


    /* =====================================================
       NEXT SCENE
    ===================================================== */

    function goNext() {

        if (!started) {
            return;
        }


        if (finished) {
            return;
        }


        if (transitionLocked) {
            return;
        }


        transitionLocked =
            true;


        const scenes =
            getScenes();


        let index =
            scenes.indexOf(
                currentScene
            );


        if (index < 0) {

            index =
                sceneIndex;

        }


        let nextIndex =
            index + 1;


        /*
         * Skip hidden sections.
         */

        while (
            nextIndex <
            scenes.length &&
            (
                scenes[nextIndex].style.display ===
                "none" ||

                scenes[nextIndex].dataset.skipped ===
                "true"
            )
        ) {

            nextIndex++;

        }


        /*
         * End reached.
         */

        if (
            nextIndex >=
            scenes.length
        ) {

            transitionLocked =
                false;

            showFinalAndReveal();

            return;

        }


        const next =
            scenes[nextIndex];


        transitionLocked =
            false;


        setActiveScene(
            next
        );

    }


    /* =====================================================
       PREVIOUS SCENE
       Optional keyboard support
    ===================================================== */

    function goPrevious() {

        if (!started) {
            return;
        }


        const scenes =
            getScenes();


        const index =
            scenes.indexOf(
                currentScene
            );


        if (index <= 0) {
            return;
        }


        let previousIndex =
            index - 1;


        while (
            previousIndex >= 0 &&
            (
                scenes[previousIndex].style.display ===
                "none" ||

                scenes[previousIndex].dataset.skipped ===
                "true"
            )
        ) {

            previousIndex--;

        }


        if (
            previousIndex >= 0
        ) {

            setActiveScene(
                scenes[previousIndex]
            );

        }

    }


    /* =====================================================
       SCENE ENTERED
    ===================================================== */

    function onSceneEntered(
        scene
    ) {

        if (!scene) {
            return;
        }


        const type =
            scene.dataset.section;


        console.log(
            "🎬 Scene:",
            type
        );


        /*
         * INTRO
         */

        if (
            type ===
            "intro"
        ) {

            return;

        }


        /*
         * HERO
         */

        if (
            type ===
            "hero"
        ) {

            autoNext(
                TIMING.hero
            );

            return;

        }


        /*
         * STORY
         */

        if (
            type ===
            "story"
        ) {

            autoNext(
                TIMING.story
            );

            return;

        }


        /*
         * PHOTOS
         */

        if (type === "photos") {

    startPhotoSlideshow();

    return;

        }


        /*
         * VIDEO 1
         */

        if (
            type ===
            "video1"
        ) {

            playSceneVideo(
                "bxVideo1",
                false
            );

            return;

        }


        /*
         * INTERLUDE
         */

        if (
            type ===
            "interlude"
        ) {

            autoNext(
                TIMING.interlude
            );

            return;

        }

       /*
         * VIDEO 2
         */

        if (
            type ===
            "video2"
        ) {

            playSceneVideo(
                "bxVideo2",
                false
            );

            return;

        }

        /*
         * LETTER
         */

        if (
            type ===
            "letter"
        ) {

            autoNext(
                TIMING.letter
            );

            return;

        }

       
        /*
         * VIDEO 3
         */

       if (type === "video3") {

    playSceneVideo(
        "bxVideo3",
        false
    );

    return;

       }


        /*
         * FINAL VIDEO
         */

        if (
            type ===
            "finalVideo"
        ) {

            playSceneVideo(
                "bxFinalVideo",
                true
            );

            return;

        }


        /*
         * FINAL
         */

        if (
            type ===
            "final"
        ) {

            setFinalTimer();

        }

    }


    /* =====================================================
       AUTO NEXT
    ===================================================== */

    function autoNext(
        duration
    ) {

        clearActiveTimer();


        activeTimer =
            setTimeout(
                function () {

                    activeTimer =
                        null;

                    goNext();

                },
                duration
            );

    }


    /* =====================================================
       SKIP CURRENT
    ===================================================== */

    function skipCurrentScene() {

        if (!currentScene) {
            return;
        }


        currentScene.dataset.skipped =
            "true";


        currentScene.style.display =
            "none";


        /*
         * Move immediately.
         */

        setTimeout(
            function () {

                transitionLocked =
                    false;

                goNext();

            },
            250
        );

    }


    /* =====================================================
       VIDEO SETUP
    ===================================================== */

    function setupVideo(
        id,
        path,
        isFinal
    ) {

        const video =
            document.getElementById(
                id
            );


        if (!video) {

            console.warn(
                "⚠️ Video element missing:",
                id
            );

            return;

        }


        const source =
            video.querySelector(
                "source"
            );


        /*
         * No path.
         */

        if (
            !hasPath(path)
        ) {

            console.warn(
                "⏭️ No video path:",
                id
            );


            skipVideoElement(
                video
            );


            return;

        }


        if (!source) {

            skipVideoElement(
                video
            );


            return;

        }


        /*
         * Never autoplay during page load.
         */

        video.autoplay =
            false;


        video.removeAttribute(
            "autoplay"
        );


        video.controls =
            true;


        video.playsInline =
            true;


        /*
         * Set source.
         */

        source.src =
            path;


        video.dataset.path =
            path;


        video.dataset.final =
            isFinal
                ? "true"
                : "false";


        /*
         * Load now so missing file
         * can be detected before scene.
         */

        try {

            video.load();

        } catch (error) {

            console.warn(
                "Video load:",
                error
            );

        }


        let finished =
            false;


        let loadTimer =
            null;


        function finishVideo(
            reason
        ) {

            if (finished) {
                return;
            }


            finished =
                true;


            if (loadTimer) {

                clearTimeout(
                    loadTimer
                );

                loadTimer =
                    null;

            }


            if (
                currentVideo ===
                video
            ) {

                currentVideo =
                    null;

            }


            console.log(
                "🎥 Video complete/skip:",
                id,
                reason || ""
            );


            if (isFinal) {

                /*
                 * Final video completed.
                 * Show final message.
                 */

                showFinalAndReveal();

            } else {

                goNext();

            }

        }


        /*
         * ERROR
         */

        video.addEventListener(
            "error",
            function () {

                console.warn(
                    "⏭️ Video error:",
                    id,
                    path
                );


                skipVideoElement(
                    video
                );

            },
            {
                once: false
            }
        );


        source.addEventListener(
            "error",
            function () {

                console.warn(
                    "⏭️ Source error:",
                    id,
                    path
                );


                skipVideoElement(
                    video
                );

            },
            {
                once: false
            }
        );


        /*
         * ENDED
         */

        video.addEventListener(
            "ended",
            function () {

                finishVideo(
                    "ended"
                );

            }
        );


        /*
         * PLAY
         */

        video.addEventListener(
            "play",
            function () {

                currentVideo =
                    video;


                /*
                 * Stop other videos.
                 */

                const allVideos =
                    experience.querySelectorAll(
                        "video"
                    );


                allVideos.forEach(
                    function (other) {

                        if (
                            other !==
                            video
                        ) {

                            try {

                                other.pause();

                            } catch (e) {}

                        }

                    }
                );

            }
        );


        /*
         * CAN PLAY
         */

        video.addEventListener(
            "canplay",
            function () {

                if (loadTimer) {

                    clearTimeout(
                        loadTimer
                    );

                    loadTimer =
                        null;

                }

            }
        );


        /*
         * Loaded metadata.
         */

        video.addEventListener(
            "loadedmetadata",
            function () {

                if (loadTimer) {

                    clearTimeout(
                        loadTimer
                    );

                    loadTimer =
                        null;

                }

            }
        );


        /*
         * We intentionally don't mark a video
         * missing immediately.
         *
         * Browser gets time to load it.
         */

        loadTimer =
            setTimeout(
                function () {

                    if (
                        video.readyState <
                        2
                    ) {

                        console.warn(
                            "⏭️ Video unavailable after timeout:",
                            id
                        );


                        skipVideoElement(
                            video
                        );

                    }

                },
                TIMING.videoLoadTimeout
            );

    }


    /* =====================================================
       PLAY VIDEO WHEN SCENE OPENS
    ===================================================== */

    function playSceneVideo(
        id,
        isFinal
    ) {

        const video =
            document.getElementById(
                id
            );


        if (!video) {

            skipCurrentScene();

            return;

        }


        const path =
            video.dataset.path ||
            (
                video.querySelector(
                    "source"
                ) || {}
            ).src;


        if (
            !hasPath(path)
        ) {

            skipCurrentScene();

            return;

        }


        /*
         * Make sure video starts
         * from the beginning when scene
         * is entered.
         */

        try {

            video.currentTime =
                0;

        } catch (e) {}


        /*
         * User has already clicked Start,
         * so browser generally permits
         * media playback.
         */

        try {

            const promise =
                video.play();


            if (
                promise &&
                typeof promise.catch ===
                "function"
            ) {

                promise.catch(
                    function (error) {

                        console.warn(
                            "⚠️ Video autoplay blocked:",
                            error
                        );


                        /*
                         * Don't break the flow.
                         *
                         * If browser blocks autoplay,
                         * user can press play manually.
                         *
                         * We DON'T auto-skip a valid video
                         * merely because autoplay was blocked.
                         */

                    }
                );

            }

        } catch (error) {

            console.warn(
                "Video play error:",
                error
            );

        }

    }


    /* =====================================================
       SKIP VIDEO ELEMENT
    ===================================================== */

    function skipVideoElement(
        video
    ) {

        if (!video) {
            return;
        }


        const section =
            video.closest(
                ".bx-section"
            );


        if (!section) {
            return;
        }


        section.dataset.skipped =
            "true";


        /*
         * Stop it.
         */

        try {

            video.pause();

        } catch (e) {}


        /*
         * Do NOT remove source here.
         *
         * Keeping the configured path intact
         * makes debugging much easier and
         * respects your requirement that you
         * don't want to remove media paths.
         */


        section.style.display =
            "none";


        /*
         * If this is the currently visible
         * scene, continue.
         */

        if (
            currentScene ===
            section
        ) {

            setTimeout(
                function () {

                    transitionLocked =
                        false;

                    goNext();

                },
                250
            );

        }

    }


    /* =====================================================
       VIDEO PAUSE
    ===================================================== */

    function pauseAllVideos() {

        if (!experience) {
            return;
        }


        const videos =
            experience.querySelectorAll(
                "video"
            );


        videos.forEach(
            function (video) {

                try {

                    video.pause();

                } catch (e) {}

            }
        );


        currentVideo =
            null;

    }


   let photoTimer = null;


function startPhotoSlideshow() {

    const gallery =
        document.getElementById("bxGallery");

    const image =
        document.getElementById("bxMainPhoto");

    if (!gallery || !image) {

        skipCurrentScene();
        return;

    }


    let photos = [];

    try {

        photos =
            JSON.parse(
                gallery.dataset.photos || "[]"
            );

    } catch (error) {

        photos = [];

    }


    if (photos.length === 0) {

        skipCurrentScene();
        return;

    }


    clearPhotoTimer();


    let current =
        parseInt(
            gallery.dataset.current || "0",
            10
        );


    if (isNaN(current)) {

        current = 0;

    }


    /*
       Show first/current photo
    */

    showPhoto(
        current,
        false
    );


    function scheduleNext() {

        clearPhotoTimer();

        photoTimer =
            setTimeout(
                function () {

                    const next =
                        current + 1;


                    if (
                        next >=
                        photos.length
                    ) {

                        /*
                           All photos complete.
                           Continue cinematic journey.
                        */

                        clearPhotoTimer();

                        goNext();

                        return;

                    }


                    current =
                        next;

                    gallery.dataset.current =
                        String(current);


                    showPhoto(
                        current,
                        true
                    );


                    scheduleNext();

                },
                TIMING.photos
            );

    }


    scheduleNext();

}


function showPhoto(
    index,
    animate
) {

    const gallery =
        document.getElementById("bxGallery");

    const image =
        document.getElementById("bxMainPhoto");

    const counter =
        gallery
            ? gallery.querySelector(
                ".bx-photo-counter"
            )
            : null;


    if (!gallery || !image) return;


    let photos = [];

    try {

        photos =
            JSON.parse(
                gallery.dataset.photos || "[]"
            );

    } catch (error) {

        return;

    }


    if (!photos[index]) {

        nextPhoto(true);
        return;

    }


    /*
       Reset animation
    */

    image.classList.remove(
        "bx-photo-visible"
    );

    image.classList.remove(
        "bx-photo-enter"
    );


    if (animate) {

        image.classList.add(
            "bx-photo-leave"
        );

    }


    setTimeout(
        function () {

            const newImage =
                new Image();


            newImage.onload =
                function () {

                    image.src =
                        photos[index];


                    image.classList.remove(
                        "bx-photo-leave"
                    );


                    void image.offsetWidth;


                    image.classList.add(
                        "bx-photo-enter"
                    );


                    image.classList.add(
                        "bx-photo-visible"
                    );


                    if (counter) {

                        counter.textContent =
                            (index + 1) +
                            " / " +
                            photos.length;

                    }

                };


            newImage.onerror =
                function () {

                    console.warn(
                        "Skipping missing image:",
                        photos[index]
                    );


                    nextPhoto(
                        true
                    );

                };


            newImage.src =
                photos[index];

        },
        animate ? 650 : 50
    );

}


function nextPhoto(
    skipMissing
) {

    const gallery =
        document.getElementById("bxGallery");

    if (!gallery) return;


    let photos = [];

    try {

        photos =
            JSON.parse(
                gallery.dataset.photos || "[]"
            );

    } catch (error) {

        photos = [];

    }


    let current =
        parseInt(
            gallery.dataset.current || "0",
            10
        );


    current++;


    if (
        current >=
        photos.length
    ) {

        clearPhotoTimer();

        goNext();

        return;

    }


    gallery.dataset.current =
        String(current);


    showPhoto(
        current,
        true
    );

}


function clearPhotoTimer() {

    if (photoTimer) {

        clearTimeout(
            photoTimer
        );

        photoTimer = null;

    }

}


    /* =====================================================
       STORY
    ===================================================== */

    function buildGallery() {

    const gallery =
        document.getElementById("bxGallery");

    if (!gallery) return;

    gallery.innerHTML = "";

    const photos =
        Array.isArray(C.photos)
            ? C.photos.filter(hasPath)
            : [];

    if (photos.length === 0) {

        hidePhotosSection();
        return;

    }

    /*
       One photo at a time.
       No scrolling.
    */

    const stage =
        document.createElement("div");

    stage.className =
        "bx-photo-stage";


    const image =
        document.createElement("img");

    image.id =
        "bxMainPhoto";

    image.alt =
        "A special memory";

    image.src =
        photos[0];

    image.draggable =
        false;


    /*
       Progress dots
    */

    const counter =
        document.createElement("div");

    counter.className =
        "bx-photo-counter";


    counter.innerHTML =
        "1 / " + photos.length;


    stage.appendChild(image);

    gallery.appendChild(stage);

    gallery.appendChild(counter);


    /*
       Store photos for slideshow engine
    */

    gallery.dataset.photos =
        JSON.stringify(photos);


    gallery.dataset.current =
        "0";


    /*
       First image missing?
       Try next automatically.
    */

    image.addEventListener(
        "error",
        function () {

            console.warn(
                "Photo failed:",
                image.src
            );

            nextPhoto(true);

        }
    );


    /*
       Clicking image opens lightbox
    */

    stage.addEventListener(
        "click",
        function () {

            if (image.src) {

                openLightbox(
                    image.src
                );

            }

        }
    );

}


    /* =====================================================
       LETTER
    ===================================================== */

    function buildLetter() {

        const box =
            document.getElementById(
                "bxLetter"
            );


        if (!box) {
            return;
        }


        box.innerHTML =
            "";


        const lines =
            Array.isArray(
                C.letter
            )
                ? C.letter
                : [];


        lines.forEach(
            function (
                text,
                index
            ) {

                const p =
                    document.createElement(
                        "p"
                    );


                p.textContent =
                    text;


                if (
                    index ===
                    lines.length - 1
                ) {

                    p.className =
                        "special";

                }


                if (
                    text ===
                    "You just became special."
                ) {

                    p.className =
                        "special";

                }


                box.appendChild(
                    p
                );

            }
        );

    }


    /* =====================================================
       PHOTO GALLERY
    ===================================================== */

    function buildGallery() {

        const gallery =
            document.getElementById(
                "bxGallery"
            );


        if (!gallery) {
            return;
        }


        gallery.innerHTML =
            "";


        const photos =
            Array.isArray(
                C.photos
            )
                ? C.photos
                : [];


        if (
            photos.length === 0
        ) {

            hidePhotosSection();

            return;

        }


        photos.forEach(
            function (
                photo,
                index
            ) {

                if (
                    !hasPath(photo)
                ) {

                    return;

                }


                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "bx-photo";


                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    photo;


                img.alt =
                    "Memory " +
                    (index + 1);


                img.loading =
                    "lazy";


                /*
                 * Missing photo:
                 * remove only that photo.
                 */

                img.addEventListener(
                    "error",
                    function () {

                        console.warn(
                            "⏭️ Photo skipped:",
                            photo
                        );


                        wrapper.remove();


                        if (
                            gallery.children.length ===
                            0
                        ) {

                            hidePhotosSection();

                        }

                    },
                    {
                        once: true
                    }
                );


                /*
                 * Lightbox
                 */

                wrapper.addEventListener(
                    "click",
                    function () {

                        openLightbox(
                            photo
                        );

                    }
                );


                wrapper.appendChild(
                    img
                );


                gallery.appendChild(
                    wrapper
                );

            }
        );


        if (
            gallery.children.length ===
            0
        ) {

            hidePhotosSection();

        }

    }


    /* =====================================================
       HIDE PHOTO SECTION
    ===================================================== */

    function hidePhotosSection() {

        const section =
            getScene(
                "photos"
            );


        if (!section) {
            return;
        }


        section.dataset.skipped =
            "true";


        section.style.display =
            "none";

    }


    /* =====================================================
       LIGHTBOX
    ===================================================== */

    function openLightbox(
        src
    ) {

        const lightbox =
            document.getElementById(
                "bxLightbox"
            );


        const image =
            document.getElementById(
                "bxLightboxImage"
            );


        if (
            !lightbox ||
            !image
        ) {

            return;

        }


        image.src =
            src;


        lightbox.classList.add(
            "show"
        );

    }


    function closeLightbox() {

        const lightbox =
            document.getElementById(
                "bxLightbox"
            );


        if (lightbox) {

            lightbox.classList.remove(
                "show"
            );

        }

    }


    function setupLightbox() {

        const close =
            document.getElementById(
                "bxClose"
            );


        if (close) {

            close.addEventListener(
                "click",
                closeLightbox
            );

        }


        const lightbox =
            document.getElementById(
                "bxLightbox"
            );


        if (lightbox) {

            lightbox.addEventListener(
                "click",
                function (
                    event
                ) {

                    if (
                        event.target ===
                        lightbox
                    ) {

                        closeLightbox();

                    }

                }
            );

        }


        document.addEventListener(
            "keydown",
            function (
                event
            ) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeLightbox();

                }

            }
        );

    }


    /* =====================================================
       MUSIC
    ===================================================== */

    function setupMusic() {

        if (
            !hasPath(
                C.music
            )
        ) {

            console.warn(
                "ℹ️ No music configured."
            );

            return;

        }


        music =
            document.createElement(
                "audio"
            );


        music.id =
            "birthdayMusic";


        music.src =
            C.music;


        music.loop =
            true;


        music.preload =
            "auto";


        music.volume =
            typeof C.musicVolume ===
            "number"

                ? Math.max(
                    0,
                    Math.min(
                        1,
                        C.musicVolume
                    )
                )

                : .45;


        music.addEventListener(
            "error",
            function () {

                console.warn(
                    "⚠️ Music unavailable. Continuing without music."
                );

            },
            {
                once: true
            }
        );


        document.body.appendChild(
            music
        );


        const button =
            document.getElementById(
                "bxMusic"
            );


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            function () {

                if (!music) {
                    return;
                }


                if (
                    music.paused
                ) {

                    playMusic();

                } else {

                    music.pause();

                    button.textContent =
                        "🔇";

                }

            }
        );

    }


    function playMusic() {

        if (!music) {
            return;
        }


        const button =
            document.getElementById(
                "bxMusic"
            );


        try {

            const promise =
                music.play();


            if (
                promise &&
                typeof promise.catch ===
                "function"
            ) {

                promise.catch(
                    function () {

                        console.warn(
                            "ℹ️ Music autoplay blocked."
                        );

                    }
                );

            }


            if (button) {

                button.textContent =
                    "🎵";

            }

        } catch (error) {

            console.warn(
                "Music play failed:",
                error
            );

        }

    }


    /* =====================================================
       START BUTTON
    ===================================================== */

    function setupStartButton() {

        const button =
            document.getElementById(
                "bxStart"
            );


        if (!button) {

            console.error(
                "❌ bxStart not found."
            );

            return;

        }


        button.addEventListener(
            "click",
            function () {

                if (started) {
                    return;
                }


                started =
                    true;


                button.disabled =
                    true;


                button.textContent =
                    "Opening...";


                /*
                 * Music starts from actual
                 * user interaction.
                 */

                playMusic();


                /*
                 * Hero.
                 */

                const hero =
                    getScene(
                        "hero"
                    );


                if (!hero) {

                    console.error(
                        "❌ Hero scene missing."
                    );

                    return;

                }


                console.log(
                    "🎬 CINEMATIC START"
                );


                setActiveScene(
                    hero
                );

            }
        );

    }


    /* =====================================================
       PROGRESS BAR
    ===================================================== */

    function updateProgress(
        scenes,
        index
    ) {

        const bar =
            document.getElementById(
                "bxProgress"
            );


        if (!bar) {
            return;
        }


        const total =
            scenes.length;


        const percent =
            total > 1

                ? (
                    index /
                    (total - 1)
                ) * 100

                : 0;


        bar.style.width =
            percent + "%";

    }


    /* =====================================================
       KEYBOARD / TOUCH SAFETY
    ===================================================== */

    function setupKeyboard() {

        document.addEventListener(
            "keydown",
            function (
                event
            ) {

                if (!started) {
                    return;
                }


                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    goNext();

                }


                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    goPrevious();

                }

            }
        );

    }


    /* =====================================================
       FINAL MESSAGE
    ===================================================== */

    function showFinalAndReveal() {

        if (
            finalCelebrationStarted
        ) {

            return;

        }


        finalCelebrationStarted =
            true;


        clearActiveTimer();


        pauseAllVideos();


        const finalScene =
            getScene(
                "final"
            );


        if (!finalScene) {

            revealOriginalPage();

            return;

        }


        /*
         * Make final scene visible.
         */

        finalScene.style.display =
            "";


        finalScene.dataset.skipped =
            "false";


        /*
         * If current scene exists,
         * animate normally.
         */

        setActiveScene(
            finalScene
        );


        /*
         * Hearts / particles.
         */

        createHeartRain();


        /*
         * Let final message stay visible
         * before original garden appears.
         */

        activeTimer =
            setTimeout(
                function () {

                    revealOriginalPage();

                },
                TIMING.finalRevealDelay
            );

    }


    /* =====================================================
       HEART RAIN
    ===================================================== */

    function createHeartRain() {

        const symbols = [
            "♥",
            "❤",
            "💗",
            "✨",
            "💖"
        ];


        for (
            let i = 0;
            i < 65;
            i++
        ) {

            const heart =
                document.createElement(
                    "div"
                );


            heart.textContent =
                symbols[
                    Math.floor(
                        Math.random() *
                        symbols.length
                    )
                ];


            heart.style.position =
                "fixed";


            heart.style.left =
                (
                    Math.random() *
                    100
                ) +
                "vw";


            heart.style.top =
                "-40px";


            heart.style.zIndex =
                "100000";


            heart.style.fontSize =
                (
                    15 +
                    Math.random() *
                    25
                ) +
                "px";


            heart.style.color =
                "#ff65b9";


            heart.style.pointerEvents =
                "none";


            const duration =
                3000 +
                Math.random() *
                3500;


            if (
                typeof heart.animate ===
                "function"
            ) {

                heart.animate(
                    [
                        {
                            transform:
                                "translateY(0) rotate(0deg)",
                            opacity:
                                1
                        },

                        {
                            transform:
                                "translateY(115vh) rotate(600deg)",
                            opacity:
                                0
                        }
                    ],
                    {
                        duration:
                            duration,

                        easing:
                            "ease-out"
                    }
                );

            }


            document.body.appendChild(
                heart
            );


            setTimeout(
                function () {

                    if (
                        heart &&
                        heart.parentNode
                    ) {

                        heart.remove();

                    }

                },
                duration + 500
            );

        }

    }


    /* =====================================================
       REVEAL ORIGINAL BIRTHDAY PAGE
    ===================================================== */

    function revealOriginalPage() {

        if (finished) {
            return;

        }


        finished =
            true;


        console.log(
            "🎆 Revealing original birthday experience."
        );


        /*
         * Activate original page.
         *
         * We don't delete anything from
         * the original HTML.
         */

        const originalCanvas =
            document.getElementById(
                "canvas"
            );


        if (
            originalCanvas
        ) {

            originalCanvas.style.visibility =
                "visible";

            originalCanvas.style.opacity =
                "1";

        }


        /*
         * Try original garden animation.
         */

        try {

            if (
                typeof startHeartAnimation ===
                "function"
            ) {

                startHeartAnimation();

            }

        } catch (error) {

            console.warn(
                "Garden animation unavailable:",
                error
            );

        }


        /*
         * Try original fireworks.
         */

        try {

            if (
                typeof fireworks ===
                "function"
            ) {

                fireworks();

            }

        } catch (error) {

            console.warn(
                "Fireworks unavailable:",
                error
            );

        }


        /*
         * Fade cinematic layer.
         */

        if (experience) {

            experience.style.transition =
                "opacity 1.8s ease";


            experience.style.opacity =
                "0";


            experience.style.pointerEvents =
                "none";


            setTimeout(
                function () {

                    if (
                        experience
                    ) {

                        experience.classList.add(
                            "bx-hidden"
                        );

                    }

                },
                1900
            );

        }

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        safeRun(
            "scene CSS",
            installSceneEngineCSS
        );


        safeRun(
            "createExperience",
            createExperience
        );


        if (!experience) {

            return;

        }


        safeRun(
            "buildStory",
            buildStory
        );


        safeRun(
            "buildLetter",
            buildLetter
        );


        safeRun(
            "buildGallery",
            buildGallery
        );


        safeRun(
            "setupMusic",
            setupMusic
        );


        safeRun(
            "setupStartButton",
            setupStartButton
        );


        safeRun(
            "setupLightbox",
            setupLightbox
        );


        safeRun(
            "setupKeyboard",
            setupKeyboard
        );


        /*
         * Videos.
         */

        safeRun(
            "video1",
            function () {

                setupVideo(
                    "bxVideo1",
                    C.memoryVideo,
                    false
                );

            }
        );


        safeRun(
            "video2",
            function () {

                setupVideo(
                    "bxVideo2",
                    C.secondVideo,
                    false
                );

            }
        );


        safeRun(
            "finalVideo",
            function () {

                setupVideo(
                    "bxFinalVideo",
                    C.finalVideo,
                    true
                );

            }
        );


        /*
         * IMPORTANT:
         *
         * Intro is the ONLY active scene
         * at initial load.
         *
         * No video is played here.
         */

        const allScenes =
            getScenes();


        allScenes.forEach(
            function (scene) {

                scene.classList.remove(
                    "active"
                );

                scene.classList.remove(
                    "exit"
                );

            }
        );


        const intro =
            getScene(
                "intro"
            );


        if (intro) {

            intro.classList.add(
                "active"
            );


            currentScene =
                intro;


            sceneIndex =
                0;


            updateProgress(
                allScenes,
                0
            );

        }


        console.log(
            "❤️ Cinematic Birthday Experience READY"
        );


        console.log(
            "👆 Waiting for Open Your Surprise..."
        );

    }


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }


})();
