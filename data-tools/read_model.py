#!/usr/bin/env python3

from neo4j import GraphDatabase
import os
import csv
import json
import argparse

DEFINITION_YAML = '_definitions.yaml'
PROPERTIES = 'properties'
LINKS = 'links'
OBJ_TYPE = 'type'
TYPE = 'type'
LINK_NAME = 'name'
TARGET_TYPE = 'target_type'
MULTIPLICITY = 'multiplicity'
BACK_REF = 'backref'
REL_LABEL = 'label'
LABEL_NEXT = 'next'
SYSTEM_PROPERTIES = 'systemProperties'

ignoreTypes = {'ToOne', 'ToMany'}

systemProperties = {
    "id": "String",
    "state": 'String',
    "created_datetime": "String",
    "updated_datetime": "String",
    "project_id": "String"
}

# Convert snake case into Camel case
def camelCase(org):
    if type(org) == str:
        return ''.join([x.capitalize() for x in org.split('_')])
    else:
        print('NOT a string, can\'t be camel cased!')
        return org

# Get type info from description
def getType(name, desc):

    mapping = {
        'string': 'String',
        'integer': 'Int',
        'array': 'Array',
        'object': 'Object'
       }

    # Default type is '___'
    result = '___'
    # Desc has type info
    if 'type' in desc:
        result = desc[TYPE]
        if result in mapping:
            result = mapping[result]
        else:
            print("################## unknown type: {}".format(result))
    # Desc has Enum info
    elif 'enum' in desc:
        name = camelCase(name)
        enum = desc['enum']
        if len(enum) == 1:
            result = ','.join(enum)
        else:
            if name in ignoreTypes:
                result = name
            else:
                enum_set = set(enum)
                if name in enums:
                    if not enums[name] == enum_set:
                        print('Different enum with same name: {}'.format(name))
                        print(enums[name] ^ enum_set)
                        name += '1'
                else:
                    enums[name] = enum_set
                result = name
    # Desc has $ref info
    elif '$ref' in desc:
        result = getRefType(desc)
    elif 'anyOf' in desc:
        enum = []
        for i, t in enumerate(desc['anyOf']):
            enum.append(getType('{}_{}'.format(name, i), t))
        result = getType(name, {'enum': enum})
    elif 'oneOf' in desc:
        enum = []
        for i, t in enumerate(desc['oneOf']):
            enum.append(getType('{}_{}'.format(name, i), t))
        result = getType(name, {'enum': enum})
    else:
        print('############### unknown data type description: {}'.format(desc))

    return result

# Get $ref type from description
# Assume all Ref Types are defined inside DEFINITION_YAML object
# And all "local Ref Types" starts with '#" are inside DEFINITION_YAML
def getRefType(desc):
    result = '$ref'
    # print(desc)
    ref = '$ref'
    if ref in desc:
        # Add DEFINITION_YAML in front of "local Ref Types"
        if desc[ref].startswith('#/'):
            desc[ref] = '{}{}'.format(DEFINITION_YAML, desc[ref])

        if desc[ref].startswith(DEFINITION_YAML):
            subType = desc[ref].split('#/')[1]
            # print(subType)
            # print(definitions[subType])
            result = getType(subType, definitions[subType])
        else:
            print('Wrong ref type: {}'.format(desc[ref]))
    else:
        print('"{}" is not a Ref Type!'.format(desc))
    return result

def processNode(name, desc):
    id = desc['id']
    props = {}
    # Add system properties first
    for prop in desc[SYSTEM_PROPERTIES]:
        props[prop] = systemProperties[prop]

    # Gather properties
    for prop, prop_desc in desc[PROPERTIES].items():
        prop_type = getType(prop, prop_desc)
        # Assume 'type' property must be same as 'id' of the node
        if prop == OBJ_TYPE:
            if prop_type != id:
                print('############### Wrong type: {}'.format(prop_type))
        elif prop_type in ignoreTypes:
            pass
        else:
            props[prop] = prop_type

    nodes[id] = props

def processEdges(name, desc):
    id = desc['id']
    props = nodes[id]
    # Gather linked nodes
    for rel in desc[LINKS]:
        if LINK_NAME in rel and TARGET_TYPE in rel and MULTIPLICITY in rel:
            linkName = rel[LINK_NAME]
            targetType = rel[TARGET_TYPE]
            relation = rel[MULTIPLICITY]
            backRef = rel[BACK_REF]
            label = rel[REL_LABEL]
            if relation == 'many_to_one' or relation == 'many_to_many':
                # Relationship with self, loop edge
                if id == targetType and linkName == backRef and label == LABEL_NEXT:
                    props['next_{}'.format(linkName)] = '[{}] @relation(name:"{}")'.format(targetType, label)
                    props['prior_{}'.format(linkName)] = '[{}] @relation(name:"{}", direction:IN)'.format(targetType, label)
                elif id == targetType:
                    print('#### Special loop edge needs to be addressed!')
                    print(rel)
                # Normal relationship
                else:
                    props[linkName] = '[{}] @relation(name:"{}")'.format(targetType, label)
                    nodes[targetType][backRef] = '[{}] @relation(name:"{}", direction:IN)'.format(id, label)
            else:
                print('#### wrong relation: {}'.format(relation))
                print(rel)
        else:
            print('###### Wrong link format: {}'.format(rel))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Read JSON schema generated by ICDC model tool')
    parser.add_argument('json', help='Input JSON file name')
    parser.add_argument('graphql', help='Output GraphQL schema file name')
    args = parser.parse_args()

    enums = {}
    nodes = {}
    definitions = {}

    if os.path.isfile(args.json):
        with open(args.json) as json_file:
            obj = json.load(json_file)

            # Initialize definition object
            if DEFINITION_YAML in obj:
                definitions = obj[DEFINITION_YAML]

            for key, value in obj.items():
                # Assume all keys start with '_' are not regular nodes
                if not key.startswith('_'):
                    processNode(key, value)
            for key, value in obj.items():
                # Assume all keys start with '_' are not regular nodes
                if not key.startswith('_'):
                    processEdges(key, value)

    else:
        print('{} is not a file'.format(args.json))

    with open(args.graphql, 'w') as graphql_file:
        # Output Enums
        for name, enum in enums.items():
            enumLine = 'enum {} {{'.format(name)
            print(enumLine)
            print(enumLine, file=graphql_file)

            for item in enum:
                enumItem = '  {}'.format(item)
                print(enumItem)
                print(enumItem, file=graphql_file)

            enumEnd = '}\n'
            print(enumEnd)
            print(enumEnd, file=graphql_file)

        # Output Types
        for name, props in nodes.items():
            typeLine = 'type {} {{'.format(name)
            print(typeLine)
            print(typeLine, file=graphql_file)
            for prop, propType in props.items():
                propLine = '  {}: {}'.format(prop, propType)
                print(propLine)
                print(propLine, file=graphql_file)
            typeEnd = '}\n'
            print(typeEnd)
            print(typeEnd, file=graphql_file)

    print('Types: {}, Enunms: {}'.format(len(nodes), len(enums)))
