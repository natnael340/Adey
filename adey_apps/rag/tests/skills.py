from pydantic import BaseModel, SecretStr

from adey_apps.rag.skills.base import Skill


class EchoConfig(BaseModel):
    api_key: SecretStr


class EchoKey(Skill):
    key = "test.echo_key"
    description = "Echo the last 4 characters of the configured API key."
    config_model = EchoConfig

    def run(self):
        return self.config.api_key.get_secret_value()[-4:]


class Boom(Skill):
    key = "test.boom"
    description = "Always fails."

    def run(self):
        raise RuntimeError("upstream said sk-secret-1234 is wrong")


class WriteThing(Skill):
    key = "test.write"
    description = "Writes something."
    read_only = False

    def run(self):
        return "written"
