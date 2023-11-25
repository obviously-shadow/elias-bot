import { AnySelectMenuInteraction, ButtonInteraction, CommandInteraction } from "discord.js";

export interface Command {

   data: any;
   onCommandInteraction(interaction: CommandInteraction);
   onButtonInteraction?(interaction: ButtonInteraction);
   onSelectMenuInteraction?(interaction: AnySelectMenuInteraction);

}