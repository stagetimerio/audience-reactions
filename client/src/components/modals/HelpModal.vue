<template>
  <Modal
    :open="props.open"
    title="Documentation"
    modal-class="max-w-prose"
    body-class="prose"
    closable
    cancel-label="Close"
    @update:open="emit('update:open', $event)"
  >
    <p>
      Hey there! Want to see real-time reactions from your audience? All they need is a link and a browser, no app installations necessary. Here&#39;s your quick guide on setting it up:
    </p>
    <hr>

    <h3 id="-sharing-the-emoji-fun-with-your-audience">
      📲 Sharing the Emoji Fun with Your Audience</h3>
    <figure>
      <img
        src="/assets/phone-screen.jpg"
        alt="A phone screen displaying Audience Reacts interface with emojis"
        class="rounded max-w-xl max-h-[300px] mx-auto"
      >
      <figcaption class="text-center">
        Audience Reacts in action on a phone screen.
      </figcaption>
    </figure>

    <ol>
      <li>Hit the &quot;Shareable Link&quot; button to grab the public link.</li>
      <li>Alternatively, if you love QR codes (because who doesn&#39;t?), click on the QR Code icon to download one.</li>
      <li>Remember to make sure the buttons are visible. Toggle using the "Show/Hide Buttons" function before sharing.</li>
    </ol>
    <hr>

    <h3 id="-boosting-stage-confidence">
      🎤 Boosting Stage Confidence
    </h3>

    <figure>
      <img
        src="/assets/stage-monitor.jpg"
        alt="A monitor in front of a stage showing emoji reactions"
        class="rounded max-w-xl max-h-[300px] mx-auto"
      >
      <figcaption class="text-center">
        Audience&#39;s reactions displayed on a stage monitor.
      </figcaption>
    </figure>

    <ol>
      <li>Provide your talent with a confidence monitor displaying real-time reactions.</li>
      <li>Grab the link as you&#39;d do above using the &quot;Shareable Link&quot; button.</li>
      <li>For a cleaner look, add <code>&amp;hide-ui=1</code> to your URL to wave goodbye to all UI elements.</li>
    </ol>
    <hr>

    <h3 id="-livestreaming-with-obs-studio">
      🎥 Livestreaming with OBS Studio
    </h3>

    <figure>
      <img
        src="/assets/obs-interface.jpg"
        alt="OBS Studio interface with Audience Reacts overlay"
        class="rounded max-w-xl max-h-[300px] mx-auto"
      >
      <figcaption class="text-center">
        Integrating emoji reactions into your livestream.
      </figcaption>
    </figure>
    <ol>
      <li>Overlaying those awesome reactions on your livestream is a game-changer.</li>
      <li>Check out our guide on <a href="https://stagetimer.io/docs/integration-with-obs-studio/" target="_blank" rel="noopener">integration with OBS Studio</a>.</li>
      <li>Remember, when setting it up, use the sharable link from our app and add <code>&amp;background=TRANSPARENT&amp;hide-ui=1</code> to the URL. Voila! A sleek transparent background with no distractions.</li>
    </ol>
    <hr>

    <h3 id="-bringing-emojis-to-zoom-calls">
      📹 Bringing Emojis to Zoom Calls
    </h3>
    <figure>
      <img
        src="/assets/zoom-overlay.jpg"
        alt="Zoom interface with emoji reactions from Audience Reacts"
        class="rounded max-w-xl max-h-[300px] mx-auto"
      >
      <figcaption class="text-center">
        Jazz up your Zoom calls with real-time emoji reactions.
      </figcaption>
    </figure>
    <ol>
      <li>Overlay reactions right onto your Zoom webcam feed.</li>
      <li>Just follow the same OBS Studio guide, then hit the &quot;Start Virtual Camera&quot; option in OBS.</li>
      <li>Swap to the virtual camera from OBS in Zoom, and you&#39;re all set!</li>
    </ol>
    <hr>

    <p>
      Now, get out there and feel the energy from your audience in real time! If you&#39;ve got questions, we&#39;re always here to help. Happy reacting! 🥳
    </p>

    <p>
      <a href="https://stagetimer.io/contact/" target="_plank" rel="noopener">Contact us</a>
    </p>
  </Modal>
</template>

<script setup>
import Modal from './Modal.vue'

const emit = defineEmits(['update:open'])
const props = defineProps({
  open: Boolean,
})
</script>
