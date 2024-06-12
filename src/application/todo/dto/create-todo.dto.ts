import { IsIn, IsNotEmpty } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty({ message: 'Task must be given.' })
  task: string;

  @IsNotEmpty({ message: 'Is Done must be given.' })
  @IsIn([0, 1])
  isDone: number;
}
