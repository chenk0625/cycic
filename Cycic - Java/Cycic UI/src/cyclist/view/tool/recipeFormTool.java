package cyclist.view.tool;

import javafx.scene.image.Image;

import org.puremvc.java.multicore.patterns.mediator.Mediator;

import cyclist.view.component.View;
import cyclist.view.tool.view.recipeForm;

public class recipeFormTool implements Tool {

	@Override
	public Image getIcon() {
		return Resources.getIcon("table");
	}

	@Override
	public String getName() {
		return "recipeForm";
	}

	@Override
	public View getView() {
		View view = new recipeForm();
		view.setParam("Recipe Builder");
		return view;
	}
	
	@Override
	public Mediator getMediator() {
		return null;
	}

}