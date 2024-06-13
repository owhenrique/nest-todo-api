import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoEntity } from './entity/todo.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

const TodoEntityList: TodoEntity[] = [
  new TodoEntity({ id: '1', task: 'task-1', isDone: 0 }),
  new TodoEntity({ id: '2', task: 'task-2', isDone: 0 }),
  new TodoEntity({ id: '3', task: 'task-3', isDone: 1 }),
];

const UpdatedTodoEntity = new TodoEntity({
  id: '1',
  task: 'task-1',
  isDone: 1,
});

describe('TodoService', () => {
  let todoService: TodoService;
  let todoRepository: Repository<TodoEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(TodoEntityList),
            findOneOrFail: jest.fn().mockResolvedValue(TodoEntityList[0]),
            create: jest.fn().mockReturnValue(TodoEntityList[0]),
            merge: jest.fn().mockReturnValue(UpdatedTodoEntity),
            save: jest.fn().mockResolvedValue(TodoEntityList[0]),
            softDelete: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
    todoRepository = module.get<Repository<TodoEntity>>(
      getRepositoryToken(TodoEntity),
    );
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
    expect(todoRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a todo list entity successfully', async () => {
      // Arrange
      // Act
      const result = await todoService.findAll();
      // Assert
      expect(result).toEqual(TodoEntityList);
      expect(todoRepository.find).toHaveBeenCalledTimes(1);
    });
    it('should throw an error', () => {
      // Arrange
      jest.spyOn(todoRepository, 'find').mockRejectedValueOnce(new Error());
      // Act
      // Assert
      expect(todoService.findAll()).rejects.toThrow();
    });
  });

  describe('findOneOrFail', () => {
    it('should return a todo entity item successfully', async () => {
      // Arrange
      // Act
      const result = await todoService.findOneOrFail('1');
      // Assert
      expect(result).toEqual(TodoEntityList[0]);
      expect(todoRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });
    it('should throw a not found exception', () => {
      // Arrange
      jest
        .spyOn(todoRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());
      // Act
      // Assert
      expect(todoService.findOneOrFail('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new todo entity item successfully', async () => {
      // Arrange
      const data: CreateTodoDto = {
        task: 'new-task',
        isDone: 0,
      };
      // Act
      const result = await todoService.create(data);
      // Assert
      expect(result).toEqual(TodoEntityList[0]);
      expect(todoRepository.create).toHaveBeenCalledTimes(1);
      expect(todoRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      // Arrange
      const data: CreateTodoDto = {
        task: 'new-task',
        isDone: 0,
      };
      jest.spyOn(todoRepository, 'save').mockRejectedValueOnce(new Error());
      // Act
      // Assert
      expect(todoService.create(data)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a todo entity item successfully', async () => {
      // Arrange
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };
      jest
        .spyOn(todoRepository, 'save')
        .mockResolvedValueOnce(UpdatedTodoEntity);
      // Act
      const result = await todoService.update('1', data);
      // Assert
      expect(result).toEqual(UpdatedTodoEntity);
    });

    it('should throw a not found exception', () => {
      // Arrange
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };
      jest
        .spyOn(todoRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());
      // Act
      // Assert
      expect(todoService.update('1', data)).rejects.toThrow(NotFoundException);
    });
    it('should throw an exception', () => {
      // Arrange
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };
      jest.spyOn(todoRepository, 'save').mockRejectedValueOnce(new Error());
      // Act
      // Assert
      expect(todoService.update('1', data)).rejects.toThrow();
    });
  });

  describe('deleteById', () => {
    it('should delete an todo entity item successfuly', async () => {
      // Arrange
      // Act
      const result = await todoService.deleteById('1');
      // Assert
      expect(result).toBeUndefined();
      expect(todoRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(todoRepository.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception', () => {
      // Arrange
      jest
        .spyOn(todoRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());
      // Act
      // Assert
      expect(todoService.deleteById('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw an exception', () => {
      // Arrange
      jest
        .spyOn(todoRepository, 'softDelete')
        .mockRejectedValueOnce(new Error());
      // Act
      // Assert
      expect(todoService.deleteById('1')).rejects.toThrow();
    });
  });
});
