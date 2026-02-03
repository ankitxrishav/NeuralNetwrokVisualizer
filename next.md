Extend the existing neural network visualizer without breaking or replacing the current visualization.

The current layer-wise block visualization (as shown in Image 1) is correct and must be preserved exactly as it is. This view represents the architectural flow of the model and should remain the default structural view.

In addition to this, introduce a second, complementary visualization mode inspired by classic neural network diagrams (as shown in Image 2). This new mode should visually represent neurons and connections between layers, focusing on conceptual understanding rather than exact tensor shapes.

Requirements:
	•	Keep the existing block-based layer visualization unchanged and fully functional.
	•	Add a toggle or switch to change between:
	•	Architecture View (current block/layer flow view)
	•	Neural Graph View (node-and-connection style)

Neural Graph View specifications:
	•	Represent each layer as a vertical column of neurons.
	•	Input layer, hidden layers, and output layer must be visually distinguishable.
	•	Draw connections between neurons of adjacent layers.
	•	For large layers, intelligently sample or compress neurons to avoid clutter.
	•	Use visual cues (color, thickness, opacity) to represent:
	•	Layer type
	•	Relative neuron count
	•	Optional: weight magnitude (if available)
	•	Layout must be centered, balanced, and readable on large canvases.

Interaction:
	•	Smooth zoom and pan support.
	•	Hovering a layer or neuron highlights its connections.
	•	Clicking a layer syncs/highlights the same layer in the Architecture View.
	•	Switching views must not reload the model.

Design constraints:
	•	Maintain a dark, professional, developer-focused UI.
	•	Ensure high contrast and readability.
	•	No overlap between UI panels and visualization canvas.
	•	The visualization canvas must be the dominant element.

Goal:

The final system should provide two complementary perspectives:
	•	One for engineering accuracy (layer/block view)
	•	One for conceptual understanding (neuron/connection view)

The project’s core purpose is to let users see and understand neural networks clearly, both structurally and intuitively, without sacrificing performance or clarity.