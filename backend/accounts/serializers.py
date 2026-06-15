from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    profiles = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    buildingAccess = serializers.JSONField(source="building_access", required=False)

    class Meta:
        model = User
        fields = ["id", "name", "email", "profiles", "department", "buildingAccess"]
        read_only_fields = ["id", "email"]
