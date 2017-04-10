def f(x = 1, y = 2):
        return x + y, x - y
x, y = f(y = 2, x = 1)
print(x, y)
