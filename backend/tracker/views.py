from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .file_utils import load_data, save_data
from .serializers import ActionSerializer


class ActionList(APIView):
    def get(self, request):
        actions = load_data()
        return Response(actions)

    def post(self, request):
        data = load_data()
        serializer = ActionSerializer(data=request.data)
        if serializer.is_valid():
            new_action = serializer.validated_data
            new_action['id'] = max((item['id']
                                   for item in data), default=0) + 1
            data.append(new_action)
            save_data(data)
            return Response(new_action, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActionDetail(APIView):
    def get_object(self, pk):
        data = load_data()
        for action in data:
            if action['id'] == pk:
                return action, data
        return None, data

    def get(self, request, pk):
        action, _ = self.get_object(pk)
        if action:
            return Response(action)
        return Response({'error': 'Not found'}, status=404)

    def put(self, request, pk):
        action, data = self.get_object(pk)
        if not action:
            return Response({'error': 'Not found'}, status=404)
        serializer = ActionSerializer(data=request.data)
        if serializer.is_valid():
            updated = serializer.validated_data
            updated['id'] = pk
            for i, item in enumerate(data):
                if item['id'] == pk:
                    data[i] = updated
                    break
            save_data(data)
            return Response(updated)
        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        action, data = self.get_object(pk)
        if not action:
            return Response({'error': 'Not found'}, status=404)
        serializer = ActionSerializer(action, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.validated_data
            for i, item in enumerate(data):
                if item['id'] == pk:
                    data[i].update(updated)
                    break
            save_data(data)
            return Response(data[i])
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        action, data = self.get_object(pk)
        if not action:
            return Response({'error': 'Not found'}, status=404)
        data = [a for a in data if a['id'] != pk]
        save_data(data)
        return Response(status=204)
